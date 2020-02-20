"use strict"

global.Promise = require('bluebird').Promise
Promise.config({warnings:false})

const app = require('express')()

require('./database')
require('./app')(app)

require('./routes')(app)