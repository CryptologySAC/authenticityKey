# authenticityKey
Verification procedure to proof the authenticity of a product by using the Ark blockchain

##Concept

Nowadays it is common that products are copied and presented to the market as if they are original. 
With a few simple steps we can use the Ark blockchain - or sidechain - to prove authenticity of a product.

##The Autenticity Key

###Authenticate the product
By making a simple transaction to his own wallet (wallet x to wallet x) with a verificationKey in the vendor field a retailer/producer 
can initiate the authenticity of his product:

Do per individual product:

POST 'seed' of wallet to use to server:port/add

1) This generates a verificationKey (a unique string that identifies the product);

2) This signs the verificationKey with the seed of the wallet to create a signature;

3) This sends a transaction to your own wallet with the above key in the vendor field (the key and transactionID are now publicely available):

4) This returns the transactionID and signature to attach to an authentic product (RFID/BLE/QR/etc)

The product is now uniquely linked to the blockchain and the producer.

###Verify the product

GET 'transactionId' and 'signature' to server:port/verify

For the purchaser or seller of the product it is now very easy to proof that the product is authentic:

1) He retrieves the transactionID and signature from the product. The signature is only known to this product;

2) He does a GET request to the server

3) This searches for the transactionID on the blockchain and retrieves the verificationKey from the vendor field;

3) This retriever the public key from the sender of the transaction;

4) This verifies that the signature is correct for this address and verificationField.

##To still figure out
In worse case a copier can now purchase a handful of original products and clone their keys and fake products can show up with all the same keys that will verify.

##Optional
Create a 'notary' wallet that can authenticate producers/retailers as verified by sending a tranasction to the wallet of the producer/retailer.
