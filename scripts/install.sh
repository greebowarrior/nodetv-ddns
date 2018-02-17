#!/bin/bash

systemctl enable dyndns.service
systemctl start dyndns.service

cd /opt/dns && npm i --production