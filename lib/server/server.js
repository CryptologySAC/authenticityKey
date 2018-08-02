const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const logger = require('./logger')
const Verification = require('./utils/verification')
const api = express.Router()
const app = express.Router()

api.route('/add')
  .post(bodyParser.json(), async (req, res) => {
    try {
      const seed = req.body.seed ? req.body.seed : null
      const secondSecret = req.body.secondSecret ? req.body.secondSecret : null
      const verification = new Verification()
      await verification.connectBlockchain()
      const json = await verification.addKey(seed, secondSecret)
      if (json === null) {
        throw new Error('Bad input: check seed or balance.')
      }

      res.json({success: true, data: json})
    } catch (error) {
      logger.error(error)
      res.json({success: false, error: error.message})
    }
  })

api.route(bodyParser.json(), '/verify')
  .get(async (req, res) => {
    try {
      const transactionID = req.query.tx
      const signature = req.query.signature
      const verification = new Verification()
      await verification.connectBlockchain()
      const json = await verification.verifySignature(transactionID, signature)
      if (json === null) {
        throw new Error('Bad input: check transactionId and signature.')
      }
      res.json({success: true, data: json})
    } catch (error) {
      logger.error(error)
      res.json({success: false, error: error.message})
    }
  })

app.route('/')
  .get(bodyParser.text({ type: 'text/html' }), async (req, res) => {
    res.sendFile(path.resolve('lib/app/index.html'))
  })



module.exports = {
  api,
  app
}
