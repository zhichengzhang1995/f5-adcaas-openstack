import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getWhereSchemaFor,
  patch,
  del,
  requestBody,
  HttpErrors,
} from '@loopback/rest';
import {Endpointpolicy, Rule, Service} from '../models';
import {
  EndpointpolicyRepository,
  ServiceRepository,
  ServiceEndpointpolicyAssociationRepository,
} from '../repositories';
import {Schema, Response, CollectionResponse} from '.';
import uuid = require('uuid');

const prefix = '/adcaas/v1';

export class EndpointpolicyController {
  constructor(
    @repository(EndpointpolicyRepository)
    public endpointpolicyRepository: EndpointpolicyRepository,
    @repository(ServiceRepository)
    public serviceRepository: ServiceRepository,
    @repository(ServiceEndpointpolicyAssociationRepository)
    public serviceEndpointpolicyAssociationRepository: ServiceEndpointpolicyAssociationRepository,
  ) {}

  @post(prefix + '/endpointpolicies', {
    responses: {
      '200': {
        description: 'Endpointpolicy model instance',
        content: {'application/json': {schema: {'x-ts-type': Endpointpolicy}}},
      },
    },
  })
  async create(
    @requestBody() endpointpolicy: Partial<Endpointpolicy>,
  ): Promise<Endpointpolicy> {
    if (!endpointpolicy.id) {
      endpointpolicy.id = uuid();
    }
    return await this.endpointpolicyRepository.create(endpointpolicy);
  }

  @get(prefix + '/endpointpolicies/count', {
    responses: {
      '200': {
        description: 'Endpointpolicy model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Endpointpolicy))
    where?: Where,
  ): Promise<Count> {
    return await this.endpointpolicyRepository.count(where);
  }

  @get(prefix + '/endpointpolicies', {
    responses: {
      '200': {
        description: 'Array of Endpointpolicy model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Endpointpolicy}},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Endpointpolicy))
    filter?: Filter,
  ): Promise<Endpointpolicy[]> {
    return await this.endpointpolicyRepository.find(filter);
  }

  @get(prefix + '/endpointpolicies/{id}', {
    responses: {
      '200': {
        description: 'Endpointpolicy model instance',
        content: {'application/json': {schema: {'x-ts-type': Endpointpolicy}}},
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<Endpointpolicy> {
    return await this.endpointpolicyRepository.findById(id);
  }

  @patch(prefix + '/endpointpolicies/{id}', {
    responses: {
      '204': {
        description: 'Endpointpolicy PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody() endpointpolicy: Partial<Endpointpolicy>,
  ): Promise<void> {
    await this.endpointpolicyRepository.updateById(id, endpointpolicy);
  }

  @del(prefix + '/endpointpolicies/{id}', {
    responses: {
      '204': {
        description: 'Endpointpolicy DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.endpointpolicyRepository.deleteById(id);
  }

  @post(prefix + '/endpointpolicies/{endpointpolicyId}/rules', {
    responses: {
      '200': {
        description: 'Rules add to rule success',
        content: {'application/json': {schema: {'x-ts-type': Rule}}},
      },
    },
  })
  async createEndpointpolicyRule(
    @param.path.string('endpointpolicyId') endpointpolicyId: string,
    @requestBody() rule: Partial<Rule>,
  ): Promise<Rule> {
    return await this.endpointpolicyRepository
      .rules(endpointpolicyId)
      .create(rule);
  }

  @get(prefix + '/endpointpolicies/{endpointpolicyId}/rules', {
    responses: {
      '200': {
        description: 'Array of rule model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Rule}},
          },
        },
      },
    },
  })
  async getRules(
    @param.path.string('endpointpolicyId') endpointpolicyId: string,
  ): Promise<Rule[]> {
    return await this.endpointpolicyRepository.rules(endpointpolicyId).find();
  }
  @get(prefix + '/endpointpolicies/{endpointpolicyId}/rules/{ruleId}', {
    responses: {
      '200': {
        description: 'Rule model instance',
        content: {'application/json': {schema: {'x-ts-type': Rule}}},
      },
    },
  })
  async getRuleByID(
    @param.path.string('endpointpolicyId') endpointpolicyId: string,
    @param.path.string('ruleId') ruleId: string,
  ): Promise<Rule> {
    const result = await this.endpointpolicyRepository
      .rules(endpointpolicyId)
      .find({where: {id: ruleId}});
    if (result.length !== 0) {
      return result[0];
    } else {
      throw new HttpErrors.NotFound(
        'Condition ' +
          ruleId +
          ' for ruleId ' +
          endpointpolicyId +
          ' not found.',
      );
    }
  }

  @del(prefix + '/endpointpolicies/{endpointpolicyId}/rules/{ruleId}', {
    responses: {
      '204': {
        description: 'Rules DELETE success',
      },
    },
  })
  async deleteRuleByID(
    @param.path.string('endpointpolicyId') endpointpolicyId: string,
    @param.path.string('ruleId') ruleId: string,
  ) {
    await this.endpointpolicyRepository
      .rules(endpointpolicyId)
      .delete({id: ruleId});
  }

  @patch(prefix + '/endpointpolicies/{endpointpolicyId}/rules/{ruleId}', {
    responses: {
      '200': {
        description: 'Rule model instance',
        content: {'application/json': {schema: {'x-ts-type': Rule}}},
      },
    },
  })
  async updateRuleByID(
    @param.path.string('endpointpolicyId') endpointpolicyId: string,
    @param.path.string('ruleId') ruleId: string,
    @requestBody() rule: Partial<Rule>,
  ): Promise<Count> {
    return await this.endpointpolicyRepository
      .rules(endpointpolicyId)
      .patch(rule, {id: ruleId});
  }

  @get(prefix + '/endpointpolicies/{endpointpolicyId}/services', {
    responses: {
      '200': Schema.collectionResponse(
        Service,
        'Successfully retrieve Service resources',
      ),
    },
  })
  async findServices(
    @param(
      Schema.pathParameter('endpointpolicyId', 'Endpoint Policy resource ID'),
    )
    id: string,
  ): Promise<CollectionResponse> {
    let assocs = await this.serviceEndpointpolicyAssociationRepository.find({
      where: {
        endpointpolicyId: id,
      },
    });

    let serviceIds = assocs.map(({serviceId}) => serviceId);
    return new CollectionResponse(
      Service,
      await this.serviceRepository.find({
        where: {
          id: {
            inq: serviceIds,
          },
        },
      }),
    );
  }

  @get(prefix + '/endpointpolicies/{endpointpolicyId}/services/{serviceId}', {
    responses: {
      '200': Schema.response(Service, 'Successfully retrieve Service resource'),
    },
  })
  async findService(
    @param(
      Schema.pathParameter('endpointpolicyId', 'Endpoint Policy resource ID'),
    )
    endpointpolicyId: string,
    @param(Schema.pathParameter('serviceId', 'Service resource ID'))
    serviceId: string,
  ): Promise<Response> {
    let assocs = await this.serviceEndpointpolicyAssociationRepository.find({
      where: {
        serviceId: serviceId,
        endpointpolicyId: endpointpolicyId,
      },
    });

    if (assocs.length === 0) {
      throw new HttpErrors.NotFound('Cannot find association.');
    } else {
      return new Response(
        Service,
        await this.serviceRepository.findById(assocs[0].serviceId),
      );
    }
  }
}