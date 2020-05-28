var AWS = require("aws-sdk");

let awsConfig = {
    "region": "ap-southeast-1",
    "endpoint": "dynamodb.ap-southeast-1.amazonaws.com",
    "accessKeyId": "AKIA2MHOP7MJ4LBAR27C",
    "secretAccessKey": "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"
};
AWS.config.update(awsConfig);

var family_list = [];
let docClient = new AWS.DynamoDB.DocumentClient();

//This function is to getting all the items in a table in Dynamo
const data = () => {
    var params = {
        TableName: "family"
    };
    function onScan(err, data) {

        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            //console.log("Scan succeeded.");
            family_list = JSON.parse(JSON.stringify(data.Items))
        }
    }
    const GetUsers = async function () {
        await docClient.scan(params, onScan);
    }

    GetUsers();
    return family_list;
};
data();
//this function is to add an item in a table in Dynamo
const createFamily = async function (family_key,member) {
    var input = {
        "family_key":family_key,
        "members": member,
        "posts": [],
        "events": [],
        "todolists": []
    };
    var params = {
        TableName: "family",
        Item: input
    };
    docClient.put(params, function (err, data) {

        if (err) {
            console.log("users::save::error - " + JSON.stringify(err, null, 2));
        } else {
            console.log("users::save::success");
        }
    })
}
const joinFamily = async function(family_key,member)
{
    var params = {
        TableName: "family",
        Key: {
            "family_key": family_key,

        },
        UpdateExpression: "set members = :members",
        ExpressionAttributeValues: {
            ":members": member,
        },
        ReturnValues: "UPDATED_NEW"
    };
    docClient.update(params, function (err, data) {

        if (err) {
            console.log("users::save::error - " + JSON.stringify(err, null, 2));
        } else {
            console.log("users::save::success");
        }
    });
}
const create_todolist_family = async function(family_key,todolist)
{
    var params = {
        TableName: "family",
        Key: {
            "family_key": family_key,

        },
        UpdateExpression: "set todolists = :todolists",
        ExpressionAttributeValues: {
            ":todolists": todolist,
        },
        ReturnValues: "UPDATED_NEW"
    };
    docClient.update(params, function (err, data) {

        if (err) {
            console.log("users::save::error - " + JSON.stringify(err, null, 2));
        } else {
            console.log("users::save::success");
        }
    });
}
const create_post_family = async function(family_key,post)
{
    var params = {
        TableName: "family",
        Key: {
            "family_key": family_key,

        },
        UpdateExpression: "set posts = :posts",
        ExpressionAttributeValues: {
            ":posts": post,
        },
        ReturnValues: "UPDATED_NEW"
    };
    docClient.update(params, function (err, data) {

        if (err) {
            console.log("users::save::error - " + JSON.stringify(err, null, 2));
        } else {
            console.log("users::save::success");
        }
    });
}
const create_event_family = async function(family_key,event)
{
    var params = {
        TableName: "family",
        Key: {
            "family_key": family_key,

        },
        UpdateExpression: "set events = :events",
        ExpressionAttributeValues: {
            ":events": event,
        },
        ReturnValues: "UPDATED_NEW"
    };
    docClient.update(params, function (err, data) {

        if (err) {
            console.log("users::save::error - " + JSON.stringify(err, null, 2));
        } else {
            console.log("users::save::success");
        }
    });
}
export {createFamily,joinFamily,create_todolist_family,create_post_family,create_event_family,family_list};