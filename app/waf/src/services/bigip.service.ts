import {Provider, inject} from '@loopback/core';
import {BIGIPDataSource} from '../datasources/bigip.datasource';
import {getService} from '@loopback/service-proxy';
import {factory} from '../log4ts';
import {probe} from '@network-utils/tcp-ping';
import {checkAndWait} from '../utils';

export interface BigipService {
  getInfo(url: string, cred64en: string): Promise<object>;
}

export class BigipServiceProvider implements Provider<BigipService> {
  constructor(
    @inject('datasources.bigip')
    protected dataSource: BIGIPDataSource = new BIGIPDataSource(),
  ) {}

  value(): Promise<BigipService> {
    return getService(this.dataSource);
  }
}

export class BigIpManager {
  private bigipService: BigipService;
  private baseUrl: string;
  private cred64Encoded: string;
  private logger = factory.getLogger('services.BigIpManager');

  constructor(private config: BigipConfig) {
    this.baseUrl = `https://${this.config.ipAddr}:${this.config.port}`;
    this.cred64Encoded =
      'Basic ' +
      Buffer.from(`${this.config.username}:${this.config.password}`).toString(
        'base64',
      );
  }

  static async instanlize(config: BigipConfig): Promise<BigIpManager> {
    let bigIpMgr = new BigIpManager(config);
    bigIpMgr.bigipService = await new BigipServiceProvider().value();
    return bigIpMgr;
  }

  async getSys(): Promise<object> {
    await this.mustBeReachable();

    let url = `${this.baseUrl}/mgmt/tm/sys`;
    let response = await this.bigipService.getInfo(url, this.cred64Encoded);
    return JSON.parse(JSON.stringify(response))['body'][0];
  }

  async getInterfaces(): Promise<BigipInterfaces> {
    await this.mustBeReachable();

    let url = `${this.baseUrl}/mgmt/tm/net/interface`;

    let impFunc = async () => {
      let response = await this.bigipService.getInfo(url, this.cred64Encoded);
      let resObj = JSON.parse(JSON.stringify(response))['body'][0];
      this.logger.debug(`get ${url} resposes: ${JSON.stringify(resObj)}`);
      return resObj;
    };

    let checkFunc = async () => {
      return await impFunc().then(resObj => {
        let items = resObj['items'];
        for (let intf of items) {
          if (intf.macAddress === 'none') {
            this.logger.warn("bigip interface's mac addr is 'none', waiting..");
            return false;
          }
        }
        this.logger.debug('bigip mac addresses are ready to get.');
        return true;
      });
    };

    // The interface mac addresses are 'none' at the very beginning of the bigip readiness.
    return await checkAndWait(checkFunc, 60).then(
      async () => {
        return await impFunc().then(resObj => {
          let items = resObj['items'];
          let interfaces: BigipInterfaces = {};
          for (let intf of items) {
            let macAddr = intf.macAddress;
            interfaces[macAddr] = {
              name: intf.name,
              macAddress: macAddr,
            };
          }
          return interfaces;
        });
      },
      () => {
        throw new Error('bigip mac addresses are not ready to get.');
      },
    );
  }

  async getLicense(): Promise<BigipLicense> {
    await this.mustBeReachable();

    let url = `${this.baseUrl}/mgmt/tm/sys/license`;

    let response = await this.bigipService.getInfo(url, this.cred64Encoded);
    let resObj = JSON.parse(JSON.stringify(response))['body'][0];
    this.logger.debug(`get ${url} resposes: ${JSON.stringify(resObj)}`);

    for (let entry of Object.keys(resObj.entries)) {
      if (!entry.endsWith('/mgmt/tm/sys/license/0')) continue;

      return {
        registrationKey:
          resObj.entries[entry].nestedStats.entries.registrationKey.description,
      };
    }
    throw new Error(`License not found: from ${resObj}`);
  }

  async getHostname(): Promise<string> {
    await this.mustBeReachable();

    let url = `${this.baseUrl}/mgmt/tm/sys/global-settings`;

    let response = await this.bigipService.getInfo(url, this.cred64Encoded);

    let resObj = JSON.parse(JSON.stringify(response));
    this.logger.debug(
      `get ${url} resposes: ${JSON.stringify(resObj['body'][0])}`,
    );

    return resObj['body'][0]['hostname'];
  }

  private async reachable(): Promise<boolean> {
    return await probe(
      this.config.port,
      // localhost is 'Invalid IP'
      this.config.ipAddr === 'localhost' ? '127.0.0.1' : this.config.ipAddr,
      this.config.timeout,
    );
  }

  private async mustBeReachable(): Promise<void> {
    if (!(await this.reachable()))
      throw new Error(
        'Host unreachable: ' +
          JSON.stringify({
            ipaddr: this.config.ipAddr,
            port: this.config.port,
          }),
      );
  }
}

type BigipConfig = {
  username: string;
  password: string;
  ipAddr: string;
  port: number;
  timeout?: number;
};

type BigipInterfaces = {
  [key: string]: {
    macAddress: string;
    name: string;
  };
};

type BigipLicense = {
  registrationKey: string;
};
