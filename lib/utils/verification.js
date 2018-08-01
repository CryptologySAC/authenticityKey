'use strict'
require('dotenv').config()
const Joi = require('joi')
const arkjs = require('arkjs')
const crypto = require('crypto')
const network = require('../services/network')
const logger = require('../services/logger')

const addKeySchema = {
  verificationKey: Joi.string().length(16, 'utf8').required(),
  seed: Joi.string().required(),
  secondSecret: Joi.string().allow('').optional()
}

const verifySignatureSchema = {
  transactionId: Joi.string().length(64, 'utf8').required(),
  signature: Joi.string().required()
}

const blockchain = process.env.ARK_NETWORK
const node = process.env.ARK_NODE

class Verification {
  constructor () {
    this.network = network
  }

 /**
  * @dev Initialize a connection to the ARK blockchain
  * @returns true or throws
  **/
  async connectBlockchain () {
    try {
      await this.network.setNetwork(blockchain)
      await this.network.setServer(node)
      const response = await this.network.getFromNode('/api/loader/autoconfigure')
      this.network.network.config = response.data.network
      await this.network.connect(blockchain)
      await this.network.findAvailablePeers()
      arkjs.crypto.setNetworkVersion(this.network.network.version)
      return true
    } catch (error) {
      throw (error)
    }
  }

 /**
  * @dev Add a new authentic product to the blockchain
  * @param {string} seed The passphrase of the wallet used to mark a product as authentic
  * @param {string} secondSecret Optional second passphrase
  * @returns and Object with {transactionId, signature, verificationKey}
  **/
  async addKey (seed, secondSecret) {
    secondSecret = secondSecret || null

    try {
      // Generate a new verification key for this product/entry
      const verificationKey = this._generateVerificationKey(seed)

      // Verify input
      Joi.validate({
        verificationKey,
        seed,
        secondSecret: secondSecret === null ? '' : secondSecret
      }, addKeySchema, (err) => {
        if (err) {
          throw new Error(err)
        }
      })

      // Sign key with wallet
      const signature = this._signKey(verificationKey, seed)
      if (signature === null) {
        throw new Error('Could not create signature.')
      }

      // Add to blockchain
      const transaction = this._generateTransaction(seed, secondSecret, verificationKey)
      const transactionId = this._addKeyToBlockchain(transaction)

      // return TX and signature
      return {transactionId, signature, verificationKey}
    } catch (error) {
      logger.error(error)
    }
    return null
  }

 /**
  * @dev Verify the autenticity of a product by using a transaction on the blockchain and a signature
  * @param {string} transactionId The transaction that contains the information to verify the authenticity of the signature
  * @param {string} signature The signature to verify
  * @returns object with verification result and parameters used to verify
  **/
  async verifySignature (transactionId, signature) {
    try {
      // Verify input
      Joi.validate({
        transactionId,
        signature
      }, verifySignatureSchema, (err) => {
        if (err) {
          throw new Error(err)
        }
      })

    // get transaction and retrieve verificationKey from vendorfield and public key
    const {publicKey, verificationKey} = await this._retrieveKeysFromTransaction(transactionId)

    // check if address is verified client that matches the verificationKey
    let verifiedClient = await this.isVerifiedClient(publicKey)
    if (verifiedClient === null) {
      verifiedClient = 'unknown'
      logger.warn('could not authenticate client')
    }

    // verify verificationKey with signature
    const authentic = this._verifyKey(verificationKey, signature, publicKey)
    if (authentic === null) {
      throw new Error('could not authenticate signature')
    }

    return {authentic, verifiedClient, verificationKey, transactionId, signature, publicKey}

    // return true or false
    } catch (error) {
      logger.error(error)
    }
    return null
  }

  async isVerifiedClient (publicKey) {
    try {
      // use the variable for Jest and lint
      if (publicKey) {
        return false // TODO create notary wallet and veriefy test addresses, then add methods her to check them
      }
    } catch (error) {
      logger.error(error)
    }
    return null
  }

 /**
  * @dev Generate a valid transaction to add the verification key to the blockchain
  * @param {string} seed The passphrase to sign the transaction with
  * @param {sting} or null secondSecret The second passphrase if any
  * @param {string} verificationKey Th everification key to be added to the blockchain
  * @return A signed transaction object
  **/
  _generateTransaction (seed, secondSecret, verificationKey) {
    try {
      const address = this._getAddressFromSeed(seed)
      const amount = 0.00000001
      const transaction = arkjs.transaction.createTransaction(address, amount, verificationKey, seed, secondSecret)

      return transaction
    } catch (error) {
      logger.error(error)
    }
    return null
  }

 /**
  * @dev Generate a unique verification key
  * @param {string} seed The passphrase of the wallet to generate the verification key for
  * @returns 16 char verification key
  **/
  _generateVerificationKey (seed) {
    const now = Date.now().toString()
    const publicKey = this._getPublicKeyFromSeed(seed).toString()
    const secret = Buffer.from(publicKey)
    const hash = crypto.createHmac('sha256', secret).update(now).digest('hex')

    const lastNumber = now.slice(-1)
    const verificationKey = hash.substr(lastNumber, 16)

    return verificationKey.toUpperCase()
  }

 /**
  * @dev Retrieve the verificationKey and address for transactionId <transactionId> from the vendor field
  * @param {string} transactionId The transaction to retrieve the data for
  * @returns object {address:verificationKey} or null
  **/
  async _retrieveKeysFromTransaction (transactionId) {
    try {
      const params = {id: transactionId}
      const uri = '/api/transactions/get'
      const results = await this.network.getFromNode(uri, params)

      if (!results.data.hasOwnProperty('success') || !results.data.success) {
        const errorMsg = results.data.hasOwnProperty('error') && results.data.error
                          ? results.data.error : 'Failed to retrieve transaction from node.'
        throw new Error(errorMsg)
      }

      const publicKey = results.data.transaction && results.data.transaction.senderPublicKey ? results.data.transaction.senderPublicKey : null
      const verificationKey = results.data.transaction && results.data.transaction.vendorField ? results.data.transaction.vendorField : null
      return {verificationKey, publicKey}
    } catch (error) {
      logger.error(error)
    }
    return null
  }

 /**
  * @dev Retrieve the public key for address <address>
  * @param {string} address The address to retrieve the public key for (key only exists after account has made outgoing transaction)
  * @returns public key or null
  **/
  async _getPublicKey (address) {
    try {
      const params = {address}
      const uri = '/api/accounts'
      const results = await this.network.getFromNode(uri, params)

      if (!results.data.hasOwnProperty('success') || !results.data.success) {
        const errorMsg = results.data.hasOwnProperty('error') && results.data.error
                          ? results.data.error : 'Failed to retrieve address from node.'
        throw new Error(errorMsg)
      }

      const publicKey = results.data.account && results.data.account.publicKey ? results.data.account.publicKey : null
      return publicKey
    } catch (error) {
      logger.error(error)
    }
    return null
  }

 /**
  * @dev Generate the public key for seed <seed>
  * @param {string} seed The passphrase to generate the public key for
  * @returns public key or null
  **/
  _getPublicKeyFromSeed (seed) {
    try {
      const publicKey = arkjs.crypto.getKeys(seed).publicKey
      return publicKey
    } catch (error) {
      logger.error(error)
    }
    return null
  }

 /**
  * @dev Generate the address for seed <seed>
  * @param {string} seed The passphrase to generate the address for
  * @returns address or null
  **/
  _getAddressFromSeed (seed) {
    try {
      const address = arkjs.crypto.getAddress(arkjs.crypto.getKeys(seed).publicKey)
      return address
    } catch (error) {
      logger.error(error)
    }
    return null
  }

 /**
  * @dev Add a transaction to the blockchain and broadcast it
  * @param {object} transaction A signed transaction
  * @returns transactionId or null
  **/
  async _addKeyToBlockchain (transaction) {
    try {
      if (process.env.NODE_ENV === 'test') {
        return '0dae977ec5ad2f9eb8e64ff516be29d6addb4e4b5c024994912e0d4860c7bdcc'
      }

      const transactionResponse = await this.network.postTransaction(transaction)
      if (!transactionResponse.data.hasOwnProperty('success') || !transactionResponse.data.success) {
        const errorMsg = transactionResponse.data.hasOwnProperty('error') && transactionResponse.data.error
                        ? transactionResponse.data.error : 'Failed to post transaction to the network.'
        throw new Error(errorMsg)
      }

      if (transactionResponse.data.hasOwnProperty('transactionIds') && transactionResponse.data.transactionIds.length) {
        try {
          // Broadcast the transaction
          await this.network.broadcast(transaction)
        } catch (err) {
          // Do nothing, we are only bradcasting
        }

        const transactionId = transactionResponse.data.transactionIds[0]
        return transactionId
      }
      throw new Error('Did not receive a transactionID, check on blockchain.')
    } catch (error) {
      logger.error(error)
    }
    return null
  }

 /**
  * @dev Sign a verificationKey with the seed of an address
  * @param {string} verificationKey The message to sign
  * @param {string} seed The see of the address to sign with
  * @returns signature or null
  **/
  _signKey (verificationKey, seed) {
    try {
      let hash = crypto.createHash('sha256');
      hash = hash.update(Buffer.from(verificationKey, 'utf-8')).digest()
      const signature = arkjs.crypto.getKeys(seed).sign(hash).toDER().toString('hex')

      return signature
    } catch (error) {
      logger.error(error)
    }
    return null
  }

 /**
  * @dev Verify if <verificationKey> was signed by address with <publicKey>
  * @param {string} verificationKey The message the was signed
  * @param {string} signature The signature to confirm
  * @param {string} publicKey The public key of the address that signed the message
  * @returns true/false verification matches or null
  **/
  _verifyKey (verificationKey, signature, publicKey) {
    try {
      let hash = crypto.createHash('sha256')
    hash = hash.update(Buffer.from(verificationKey, 'utf-8')).digest()

    signature = Buffer.from(signature, 'hex')
    publicKey = Buffer.from(publicKey, 'hex')
    const ecpair = arkjs.ECPair.fromPublicKeyBuffer(publicKey)
    const ecsignature = arkjs.ECSignature.fromDER(signature)
    const verification = ecpair.verify(hash, ecsignature)

    return verification
    } catch (error) {
      logger.error(error)
    }
    return null
  }
}

module.exports = Verification
