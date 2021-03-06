"use strict"

const mongoose = require('mongoose')
mongoose.Promise = global.Promise




mongoose.set('useCreateIndex', true)
mongoose.set('useFindAndModify', false)
mongoose.set('useNewUrlParser', true)

const Database = ()=>{
	
	let conn = 'mongodb://'
	
	if (process.env.DB_USER && process.env.DB_PASS) conn += `${process.env.DB_USER}:${process.env.DB_PASS}@`
	conn += `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
	
	mongoose.connect(conn, {promiseLibrary:require('bluebird'), useNewUrlParser:true, useUnifiedTopology:true})
		.then(()=>{
			console.debug('Connected to MongoDB: %s:%s/%s', process.env.DB_HOST, process.env.DB_PORT, process.env.DB_NAME)
		})
		.catch(error=>{
			if (error) console.error(error.message)
		})
	
	process.on('SIGTERM', ()=>{
		mongoose.disconnect()
		process.exit(0)
	})
}
module.exports = Database()