const awsServerlessExpress = require('aws-serverless-express');
const app = require('./server');
const server = awsServerlessExpress.createServer(app);
callback(null, {
    statusCode: 200,
    body: JSON.stringify(message),
    headers: {'Content-Type': 'application/json'}
});

module.exports.universal = (event, context) => awsServerlessExpress.proxy(server, event, context);