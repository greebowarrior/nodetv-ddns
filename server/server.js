"use strict"

global.Promise = require('bluebird').Promise
Promise.config({warnings:false})

require('aws-sdk').config.update({
	region: process.env.AWS_REGION
})

const app = require('express')()

require('./database')
require('./app')(app)

require('./routes')(app)