"use strict"

const passport = require('passport')

const CF = require('cloudflare')({token:process.env.CF_API_TOKEN})
const User = require('../models/user')

const UpdateDNS = (subdomain,ips)=>{
	return new Promise(resolve=>{
		
		CF.dnsRecords.browse(process.env.CF_ZONE_ID).then(response=>{
			
			let zone_name = null
			
			let records = response.result.filter(item=>{
				if (!zone_name) zone_name == item.zone_name
				if (item.name == `${subdomain}.${item.zone_name}`) return true
			})
			
			if (records.length){
				// Update record(s)
				records.forEach(record=>{
					let ip = ''
					
					if (record.type == 'AAAA'){
						ip = ips.v6
					} else if (record.type == 'A'){
						ip = ips.v4
					}
					
					CF.dnsRecords.edit(process.env.CF_ZONE_ID, record.id, {
						name: `${subdomain}.${record.zone_name}`,
						type: record.type,
						content: ip,
						proxied: true
					})
				})
				
			} else {
				// Create record(s)
				Object.keys(ips).forEach(key=>{
					if (!ips[key] || ['v4','v6'].indexOf(key) == -1) return
					
					CF.dnsRecords.add(process.env.CF_ZONE_ID, {
						name: `${subdomain}.${zone_name}`,
						type: (key == 'v6') ? 'AAAA' : 'A',
						content: ips[key],
						proxied: true
					})
				})
			}
		})
		resolve()
	})
}

const API = (app)=>{
	
	app.route('/')
		.get((req,res)=>{
			res.send({message:'hello'})
		})
		.post(passport.authenticate('token'), (req,res)=>{
			User.findById(req.user._id)
				.then(user=>{
					if (!user) throw new Error(`User not found`)
					
					req.body.forEach(item=>{
						user.addresses[item.type] = item.address
					})
					
					return UpdateDNS(user.subdomain, user.addresses)
						.then(()=>{
							return user.save()
						})
				})
				.then(()=>{
					res.send({status:true})
				})
				.catch(error=>{
					console.error(error)
					res.status(401).send({error: 'Unauthorized'})
				})
		})
	
	// No-IP/DynDNS2 protocol compatibility for ddclient
	app.route('/nic/update')
		.get(passport.authenticate('basic'),(req,res)=>{
			if (!req.user) return res.status(401).send('badauth')
			
			User.findById(req.user._id)
				.then(user=>{
					if (!user) throw new Error(`Invalid User`)
					
					if (req.query.myip.match(/^([0-9a-f]{4}\:)/i)){
						// IPv6
						user.addresses['v6'] = req.query.myip
					} else {
						// IPv4
						user.addresses['v4'] = req.query.myip
					}
					
					if (user.addresses){
						return UpdateDNS(user.subdomain, user.addresses).then(()=>{
							return user.save()
						})
					} else {
						return Promise.resolve()
					}
				})
				.then(()=>{
					res.status(200).send('good')
				})
				.catch(error=>{
					if (error) console.error(error.message)
					res.status(200).send('badauth')
				})
		})
}



module.exports = API