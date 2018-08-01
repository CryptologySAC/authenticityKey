'use strict'

require('dotenv').config()
const express = require('express')
const logger = require('../lib/services/logger')
const server = require('../lib/services/server')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.CONFIG_PORT

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/', server)
app.listen(port)
logger.info(`Ark Product Verification server started on port: ${port}`)
