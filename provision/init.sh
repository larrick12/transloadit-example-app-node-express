#!/bin/bash
# Using Precise64 Ubuntu

sudo apt-get update

#
# Install some pre-requisites
#
sudo apt-get install -y python-software-properties

#
# MongoDB
#
sudo apt-get install -y mongodb-clients mongodb-server

#
# Utilities
#
sudo apt-get install -y make curl htop git-core vim

#
# Node and NPM
# 
sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install -y nodejs > /dev/null
sudo npm install npm -g

#
# Bower
# 
sudo npm install -g bower

echo -e "----------------------------------------"
echo -e "Default Site: http://192.168.5.4"
echo -e "----------------------------------------"