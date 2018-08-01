'use strict'
const express = require('express')
const logger = require('./logger')
const Verification = require('../utils/verification')
const router = express.Router()

router.route('/add')
  .post(async (req, res) => {
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

router.route('/verify')
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

module.exports = router
