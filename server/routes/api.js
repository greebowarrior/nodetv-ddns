"use strict"

const passport = require('passport')

const AWS = require('aws-sdk')
const R53 = new AWS.Route53()

const User = require('../models/user')

const UpdateDNS = (subdomain,ips)=>{
	return new Promise((resolve,reject)=>{
		let changes = []
		
		Object.keys(ips).forEach(key=>{
			if (!ips[key] || ['v4','v6'].indexOf(key) == -1) return
			
			changes.push({
				'Action': 'UPSERT',
				'ResourceRecordSet': {
					'Name': subdomain+'.rent-a-cunt.com.',
					'Type': (key == 'v6') ? 'AAAA' : 'A',
					'TTL': 300,
					'ResourceRecords': [{
						'Value': ips[key]
					}]
				}
			})
		})
		
		R53.changeResourceRecordSets({
			'HostedZoneId': process.env.AWS_HOSTED_ZONE_ID,
			'ChangeBatch': {'Changes':changes}
		}, function(error, json){
			if (error) return reject(error)
			if (json) resolve(json)
		})
	})
}

const API = (app)=>{
	
	app.route('/')
		.get((req,res)=>{
			res.send({message:'hello'})
		})
		.post(passport.authenticate('token',{session:false}), (req,res)=>{
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
	
	// DynDNS2 protocol compatibility
	app.route('/nic/update')
		.all(passport.authenticate('basic',{session:false,failureFlash:'badauth'}), (req,res)=>{
			User.findById(req.user._id)
				.then(user=>{
					user.addresses['v4'] = req.params.myip
					return UpdateDNS(user.subdomain, user.addresses)
				})
				.then(()=>{
					res.status(200).send('good')
				})
				.catch(error=>{
					if (error) console.error(error.message)
					res.status(200).send('badauth')
				})
		})
	
	// Legacy mode
	app.route('/api/update')
		.post((req,res)=>{
			let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
			
			if (ip.match(/^::ffff:/)){
				var match = ip.match(/::ffff:(.*)$/)
				ip = match[1]
			}
			
			if (req.body.username){
				User.findByUser(req.body.username)
					.then(user=>{
						if (!user) throw new Error(`User not found`)
						
						if (user.address == ip) return res.send({status:true})
						
						user.addresses['v4'] = ip
						
						return UpdateDNS(user.subdomain, user.addresses)
							.then(json=>{
								console.debug(json)
								return user.save({new:true})
							})
					})
					.then(()=>{
						res.send({status:true})
					})
					.catch(error=>{
						console.error(error)
						res.status(401).end({error: 'Unauthorized'})
					})
			} else {
				res.status(401).send({error: 'Unauthorized'})
			}
		})
}

module.exports = API