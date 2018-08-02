const path = require('path');

require('dotenv').config()

const express = require('express')
const logger = require('../lib/server/logger')
const server = require('../lib/server/server')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.CONFIG_PORT

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.resolve('public/')))
app.use('/api', server.api)
app.use('/', server.app)
app.listen(port)
logger.info(`Ark Product Verification server started on port: ${port}`)
