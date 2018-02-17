"use strict"

process.title = 'NuDNS'
process.chdir(__dirname)

require('dotenv-extended').config()

require('./server/server.js')
