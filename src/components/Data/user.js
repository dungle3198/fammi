
var AWS = require("aws-sdk");

let awsConfig = {
    "region": "ap-southeast-1",
    "endpoint": "dynamodb.ap-southeast-1.amazonaws.com",
    "accessKeyId": "AKIA2MHOP7MJ4LBAR27C",
    "secretAccessKey": "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"
};
AWS.config.update(awsConfig);

var user_list = [];
let docClient = new AWS.DynamoDB.DocumentClient();

//This function is to getting all the items in a table in Dynamo
const data = () => {
    var params = {
        TableName: "users"
    };
    function onScan(err, data) {

        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            //console.log("Scan succeeded.");
            user_list = JSON.parse(JSON.stringify(data.Items))
        }
    }
    const GetUsers = async function () {
        await docClient.scan(params, onScan);
    }

    GetUsers();
    return user_list;
};
data();
//this function is to add an item in a table in Dynamo
const createUser = async function (email, password, key, username,avatar,comet_id) {
    var input = {
        "email": email,
        "password": password,
        "key": key,
        "username": username,
        "avatar": avatar,
        "comet_uid": comet_id
    };
    var params = {
        TableName: "users",
        Item: input
    };
    docClient.put(params, function (err, data) {

        if (err) {
            console.log("users::save::error - " + JSON.stringify(err, null, 2));
        } else {
            console.log("users::save::success");
            data()
            alert("you have successfully signed up")
        }
    })
    
}
//this function is to get an item by id in a table in Dynamo
const readUser = async function (email) {
    var params = {
        TableName: "users",
        Key: {
            "email": email
        }
    };
    docClient.get(params, function (err, data) {
        if (err) {
            console.log("users::fetchOneByKey::error - " + JSON.stringify(err, null, 2));
        }
        else {
            console.log("users::fetchOneByKey::success - " + JSON.stringify(data, null, 2));
        }
        return JSON.parse(JSON.stringify(data));
    })

}

//this function is to update an item in a table in Dynamo
const updateUser = async function (email, password) {
    var params = {
        TableName: "users",
        Key: {
            "email": email,

        },
        UpdateExpression: "set password = :password",
        ExpressionAttributeValues: {
            ":password": password,
        },
        ReturnValues: "UPDATED_NEW"
    };
    docClient.update(params, function (err, data) {

        if (err) {
            console.log("users::save::error - " + JSON.stringify(err, null, 2));
        } else {
            console.log("users::save::success");
            data()
        }
    });
}

const deleteUser = async function (email) {
    var params = {
        TableName: "users",
        Key: {
            "email": email,
        }
    };
    docClient.delete(params, function (err, data) {
        if (err) {
            //console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            data()
            //console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
        }
    });
}


//createUser("admin","admin");
//readUser("admin");
//updateUser("admin","123456");
//deleteUser("admin");
export { docClient,createUser, readUser, updateUser, deleteUser, data, user_list }
