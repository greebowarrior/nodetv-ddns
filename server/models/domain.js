"use strict"

const mongoose = require('mongoose')

const domainSchema = mongoose.Schema({
	domain: {type:String, required:true, unique:true},
	hostedZoneId: {type:String, required:true, unique:true},
	created: {type: Date, default: new Date()},
	updated: {type: Date, default: new Date()}
})

domainSchema.statics.findByDomain = function(domain){
	return this.findOne({domain:domain})
}

domainSchema.pre('save', function(next){
	this.updated = new Date()
	next()
})

module.exports = mongoose.model('Domain', domainSchema)