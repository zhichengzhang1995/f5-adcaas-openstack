sudo git clone https://github.com/F5Networks/f5-adcaas-openstack.git
sudo apt-get update
sudo apt-get install nodejs -y
sudo apt-get install npm -y
sudo apt-get install apt-transport-https ca-certificates curl gnupg-agent     software-properties-common -y
sudo apt install docker.io -y
sudo npm install -g typescript -y
# echo yes | sudo apt install python-pip -y
# We skip the pip intall
# sudo pip install docker-compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

npm install --save-dev eslint-config-prettier@^5.0.0
sudo systemctl start docker

cd f5-adcaas-openstack/app/waf

sudo npm install
sudo npm run build
sudo npm install
sudo npm run build
sudo docker build . -t f5devcentral/f5-wafaas-openstack:latest

cd ../../scripts
sudo ./start_all.sh

cd ../test
sudo npm install -g newman newman-reporter-html
sudo ./test_all.sh
