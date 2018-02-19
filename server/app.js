"use strict"

const passport = require('passport')
const BasicStrategy = require('passport-http').BasicStrategy
const TokenStrategy = require('passport-token').Strategy

const User = require('./models/user')

const App = (app)=>{
	
	passport.use('basic', new BasicStrategy((username,token,done)=>{
		User.findOne({username:username,token:token}).exec()
			.then(user=>{
				if (!user) throw new Error(`Invalid User`)
				done(null, user)
			})
			.catch(error=>{
				done(error, false, 'badauth')
			})
	}))
	passport.use('token', new TokenStrategy((username,token,done)=>{
		User.findOne({username:username,token:token}).exec()
			.then(user=>{
				if (!user) throw new Error('Invalid user')
				done(null, user)
			})
			.catch(error=>{
				done(error, false)
			})
	}))
	
	passport.serializeUser((user,done)=>{
		done(null, user._id)
	})
	passport.deserializeUser((id,done)=>{
		User.findById(id)
			.then(user=>{
				done(null, user)
			})
			.catch(error=>{
				done(error, false)
			})
	})
	
	app.use(require('body-parser').json())
	app.use(require('body-parser').urlencoded({'extended':true}))
	
	app.use(require('compression')())
	app.use(require('helmet')())
	
	app.set('json spaces', 2)
	
	app.enable('trust proxy')
	app.disable('view cache')
	app.disable('x-powered-by')
	
	app.listen(8053, ()=>{
		console.info('Listening on port 8053')
	})
	
	app.locals.dns = require('../package.json')
	
	app.use(passport.initialize())
}

module.exports = App