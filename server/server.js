"use strict"

global.Promise = require('bluebird').Promise
Promise.config({warnings:false})

//const dns = require('../package.json')

const AWS = require('aws-sdk')

AWS.config.update({
	region: process.env.AWS_REGION
})

const User = require('./models/user')

const passport = require('passport')
const TokenStrategy = require('passport-token').Strategy

passport.use('token', new TokenStrategy((username,token,done)=>{
	User.findOne({username:username,'token':token})
		.then(user=>{
			if (!user) throw new Error('Invalid user')
			done(null, user)
		})
		.catch(error=>{
			done(error, false)
		})
}))


const app = require('express')()

app.use(require('body-parser').json())
app.use(require('body-parser').urlencoded({'extended':true}))

app.use(require('compression')())
app.use(require('helmet')())

app.enable('trust proxy')
app.disable('view cache')
app.disable('x-powered-by')


app.listen(8053, ()=>{
	console.info('Listening on port 8053')
})

const session =  require('express-session')({
	resave: false,
	saveUninitialized: true,
	secret: 'Explosive-Eastern-Cattle-Prod'
})
app.use(session)

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

app.use(passport.initialize())
app.use(passport.session())

require('./database')
require('./routes/api')(app)