# nodetv-dns

Basic af service for using CloudFlare as a Dynamic DNS Provider.
Uses the dyndns2 protocol, and is compatible with ddclient.

-

You will need:

- Node.js
- MongoDB
- Cloudflare Account

## Setup

- Create a Cloudflare API Token:
	- Permissions
		- Zone:Edit
		- DNS:Edit
	- Zone Resources
		- your domain
- `cp .env.default .env`
- Update `.env` with your API Token and Secret
- Create a user in MongoDB

> {
> "username": "ddns-username",
> "token": "<generate UUIDv4>",
> "subdomain": "my-subdomain"
> }


There's no admin interface (yet), so you'll need to manually manage your users. Soz.