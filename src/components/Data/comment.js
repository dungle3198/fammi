
var AWS = require("aws-sdk");

let awsConfig = {
    "region": "ap-southeast-1",
    "endpoint": "dynamodb.ap-southeast-1.amazonaws.com",
    "accessKeyId": "AKIA2MHOP7MJ4LBAR27C",
    "secretAccessKey": "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"
};
AWS.config.update(awsConfig);
let docClient = new AWS.DynamoDB.DocumentClient();
export {docClient}