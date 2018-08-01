'use strict'

const arkjs = require('arkjs')
const Verification = require('../../lib/utils/verification')
const networkVersion = 30 // Devnet
const verification = new Verification(networkVersion)

describe('verification', () => {
  it('should be an object', () => {
    expect(verification).toBeObject()
  })
})

describe('verification.connectBlockchain', () => {
  it('should be a function', () => {
    expect(verification.connectBlockchain).toBeFunction()
  })

  it('should return true on connection', async () => {
    const connected = await verification.connectBlockchain()
    expect(connected).toBeTrue()
  })
})

describe('verification._generateVerificationKey', () => {
  it('should be a function', () => {
    expect(verification._generateVerificationKey).toBeFunction()
  })

  it('should generate a 16 character long string', () => {
    const seed = 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat'
    const verificationKey = verification._generateVerificationKey(seed)

    expect(verificationKey).toBeString()
    expect(verificationKey).toHaveLength(16)
  })
})

describe('verification._generateTransaction', () => {
  it('should be a function', () => {
    expect(verification._generateTransaction).toBeFunction()
  })

  it('should generate a valid transaction', () => {
    const seed = 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat'
    const secondSecret = null
    const verificationKey = '0D4076FFC3087EA8'
    const result = verification._generateTransaction(seed, secondSecret, verificationKey)

    expect(result).toBeObject()
    expect(result).toContainKeys(['amount', 'asset', 'fee', 'id', 'recipientId', 'senderPublicKey', 'signature', 'timestamp', 'type', 'vendorField'])
  })
})

describe('verification._addKeyToBlockchain', () => {
  it('should be a function', () => {
    expect(verification._addKeyToBlockchain).toBeFunction()
  })
})

describe('verification._retrieveKeysFromTransaction', () => {
  it('should be a function', () => {
    expect(verification._retrieveKeysFromTransaction).toBeFunction()
  })

  it('should return a valid verification key and public key', async () => {
    const transactionId = '0dae977ec5ad2f9eb8e64ff516be29d6addb4e4b5c024994912e0d4860c7bdcc'
    const publicKey = '027538461fd40b25f08e5e64b565daca422cbc5edb6c699ca4e30cf3c678b36122'
    const verificationKey = 'marcs1970'
    const result = await verification._retrieveKeysFromTransaction(transactionId)

    expect(result).toContainKeys(['publicKey', 'verificationKey'])
    expect(result.verificationKey).toBe(verificationKey)
    expect(result.publicKey).toBe(publicKey)
  })
})

describe('verification._getPublicKey', () => {
  it('should be a function', () => {
    expect(verification._getPublicKey).toBeFunction()
  })

  it('should return a valid public key', async () => {
    const address = 'AQvJHKCcTUJKBF9n7wxotE2LVxugG3rhjh'
    const publicKey = '03e734aba4bc673b5c106bd90dfb7fe19a2faf32aa0a4a40d62ddda9d41ab239e4'
    const result = await verification._getPublicKey(address)

    expect(result).toBe(publicKey)
  })
})

describe('verification._getPublicKeyFromSeed', () => {
  it('should be a function', () => {
    expect(verification._getPublicKeyFromSeed).toBeFunction()
  })

  it('should return a valid public key', () => {
    const seed = 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat'
    const publicKey = '03e734aba4bc673b5c106bd90dfb7fe19a2faf32aa0a4a40d62ddda9d41ab239e4'
    const result = verification._getPublicKeyFromSeed(seed)

    expect(result).toBe(publicKey)
  })
})

describe('verification._getAddressFromSeed', () => {
  it('should be a function', () => {
    expect(verification._getAddressFromSeed).toBeFunction()
  })

  it('should return a valid address', () => {
    const seed = 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat'
    const address = 'AQvJHKCcTUJKBF9n7wxotE2LVxugG3rhjh'
    const result = verification._getAddressFromSeed(seed)

    expect(result).toBe(address)
  })
})

describe('verification._signKey', () => {
  it('should be a function', () => {
    expect(verification._signKey).toBeFunction()
  })

  it('should return a valid signature when signing a key', () => {
    const key = 'ArkAuthenticityKey'
    const seed = 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat'
    const expectedSignature = '304402201ce8b1d3a3185c2b3a5b4a438afc53886c327bc92d960feb47be175f905f8ae2022058bd754cc9df6f4826d89496ec9437b17b7fdbeb4c847eae9427f8f89f0abc15'
    const signature = verification._signKey(key, seed)

    expect(signature).toBeString()
    expect(signature).toBe(expectedSignature)
  })
})

describe('verification._verifyKey', () => {
  it('should be a function', () => {
    expect(verification._verifyKey).toBeFunction()
  })

  it('should return a valid signature when signing a key', () => {
    arkjs.crypto.setNetworkVersion(networkVersion)
    const seed = 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat'
    const publicKey = arkjs.crypto.getKeys(seed).publicKey

    const verificationKey = 'ArkAuthenticityKey'
    const signature = '304402201ce8b1d3a3185c2b3a5b4a438afc53886c327bc92d960feb47be175f905f8ae2022058bd754cc9df6f4826d89496ec9437b17b7fdbeb4c847eae9427f8f89f0abc15'
    const verify = verification._verifyKey(verificationKey, signature, publicKey)

    expect(verify).toBeTrue()
  })
})

describe('verification.verifySignature', () => {
  it('should be a function', () => {
    expect(verification.verifySignature).toBeFunction()
  })

  it('should correctly verify a transaction from the blockchain', async () => {
    const transactionId = '0dae977ec5ad2f9eb8e64ff516be29d6addb4e4b5c024994912e0d4860c7bdcc'
    const signature = '3045022100fc7e30b895cc97bd00895d8e0751e800dae36922a03f46168ff1d9588b66e38e02200a2214497abb119de2a8031465f33e02714c990fb39782c24c7f0676598616c6'

    const publicKey = '027538461fd40b25f08e5e64b565daca422cbc5edb6c699ca4e30cf3c678b36122'
    const verificationKey = 'marcs1970'
    const result = await verification.verifySignature(transactionId, signature)
    expect(result).toContainKeys(['authentic', 'verifiedClient', 'publicKey', 'transactionId', 'signature', 'verificationKey'])
    expect(result.transactionId).toBe(transactionId)
    expect(result.signature).toBe(signature)
    expect(result.publicKey).toBe(publicKey)
    expect(result.verificationKey).toBe(verificationKey)
    expect(result.authentic).toBeTrue()
  })
  
  it('should correctly unverify a transaction from the blockchain', async () => {
    const transactionId = '0dae977ec5ad2f9eb8e64ff516be29d6addb4e4b5c024994912e0d4860c7bdcc'
    const signature = 'BAD5022100fc7e30b895cc97bd00895d8e0751e800dae36922a03f46168ff1d9588b66e38e02200a2214497abb119de2a8031465f33e02714c990fb39782c24c7f0676598616c6'

    const publicKey = '027538461fd40b25f08e5e64b565daca422cbc5edb6c699ca4e30cf3c678b36122'
    const verificationKey = 'marcs1970'
    const result = await verification.verifySignature(transactionId, signature)
    expect(result).toContainKeys(['authentic', 'verifiedClient', 'publicKey', 'transactionId', 'signature', 'verificationKey'])
    expect(result.transactionId).toBe(transactionId)
    expect(result.signature).toBe(signature)
    expect(result.publicKey).toBe(publicKey)
    expect(result.verificationKey).toBe(verificationKey)
    expect(result.authentic).toBeFalse()
  })
})
