#!/bin/bash
source ./shared-queens.rc
# apt install python-dev python-pip
# pip install --upgrade pip
# pip install --ignore-installed python-openstackclient
# openstackclient

openstack server create --flavor newman-test-web-server-flavor --image ubuntu-bionic-server-cloudimg-amd64-20190501 --nic net-id=e12b30b7-d0d1-47f2-9be6-346913749ebc --key-name zz test_instance --config-drive True
# create server

p=`openstack server list --name test_instance -f value -c Status`
while [ $p != ACTIVE ]
do
    echo $p
    p=`openstack server list --name test_instance -f value -c Status`
done
echo $p

ip=`openstack server list --name test_instance -f value -c Networks | cut -c13-`
# get ip

echo $ip

pass=`ping $ip -c 1 -t 2 | awk 'NR==5{print}' | cut -c24-25`
while [ [$pass == " "] ]
do
    pass=`ping $ip -c 1 -t 2 | awk 'NR==5{print}' | cut -c24-25`
    echo $pass
done
# pass test

try=0
while [ $try -lt 100 ] 
do 
    try=`expr $try + 1`
	echo "sshing $ip..."
	ssh -o "StrictHostKeyChecking no" -i zz.pem ubuntu@$ip echo x
	if [ $? -eq 0 ]; then break; fi;
	sleep 1;
done

ssh -o "StrictHostKeyChecking no" -i zz.pem ubuntu@$ip
# enter the server





