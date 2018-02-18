#!/bin/bash

#if [ "$DEPLOYMENT_GROUP_NAME" == "Staging" ]; then
#	mongo --host 10.0.1.169 xvl-staging --eval "db.dropDatabase(); db.copyDatabase('xvl', 'xvl-staging')"
#	sed -i -e 's/xvl.unruly.co/xvl-staging.unruly.co/g' /etc/nginx/sites-enabled/xvl.unruly.co
#	certbot certonly -n --webroot -w /var/www/letsencrypt -d dns.silico.media
#fi

certbot certonly -n --webroot -w /var/www/letsencrypt -d dns.silico.media

systemctl daemon-reload
systemctl enable dyndns.service
systemctl restart nginx.service

cd /opt/dns; npm i --production
exit 0
