const sdkPack = require('./Config.js').sdkPack;
const client = sdkPack.client;
const secretName = sdkPack.secretName;
const produceIntoStream = require('../kinesis/producer.js').producerFunction;
const socket = require('socket.io-client')('https://ws-api.iextrading.com/1.0/tops');
// In this sample we only handle the specific exceptions for the 'GetSecretValue' API.
// See https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
// We rethrow the exception by default.

client.getSecretValue({SecretId: secretName}, function(err, data) {
  if (err) {
    if (err.code === 'DecryptionFailureException')
    // Secrets Manager can't decrypt the protected secret text using the provided KMS key.
    // Deal with the exception here, and/or rethrow at your discretion.
    throw err;
    else if (err.code === 'InternalServiceErrorException')
    // An error occurred on the server side.
    // Deal with the exception here, and/or rethrow at your discretion.
    throw err;
    else if (err.code === 'InvalidParameterException')
    // You provided an invalid value for a parameter.
    // Deal with the exception here, and/or rethrow at your discretion.
    throw err;
    else if (err.code === 'InvalidRequestException')
    // You provided a parameter value that is not valid for the current state of the resource.
    // Deal with the exception here, and/or rethrow at your discretion.
    throw err;
    else if (err.code === 'ResourceNotFoundException')
    // We can't find the resource that you asked for.
    // Deal with the exception here, and/or rethrow at your discretion.
    throw err;
  }
  else {
    // Decrypts secret using the associated KMS CMK.
    // Depending on whether the secret is a string or binary, one of these fields will be populated.
    if ('SecretString' in data) {
      secret = data.SecretString;
    } else {
      let buff = new Buffer(data.SecretBinary, 'base64');
      decodedBinarySecret = buff.toString('ascii');
    }
  }
  //  Code can now run
  socket.on('connection', function(socket) {
     console.log('A guest client connected');
  });
  socket.on('message', (message) => {
    let data = new Buffer(JSON.stringify(message))
    produceIntoStream(data);
  });
  socket.on('connect', () => {
  	//	Subscribe to topics (i.e. appl,fb,aig+)
  socket.emit('subscribe', 'firehose')
  	//	Unsubscribe from topics (i.e. aig+)
  	//	socket.emit('unsubscribe', 'aig+')
  });
  socket.connect();
})
