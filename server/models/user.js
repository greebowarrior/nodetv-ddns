"use strict"

const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
	username: {type:String, required:true, unique:true},
	token: String,
	
	subdomain: String,
	addresses: {
		v4: String,
		v6: String
	},
	domains: [{
		domain: {type:mongoose.Schema.Types.ObjectId, ref:'Domain'},
		fqdn: String
	}],
	created: {type: Date, default: new Date()},
	updated: {type: Date, default: new Date()}
})

userSchema.statics.findByUser = function(username){
	return this.findOne({username:username})
}

userSchema.pre('save', function(next){
	this.updated = new Date()
	next()
})

module.exports = mongoose.model('User', userSchema)