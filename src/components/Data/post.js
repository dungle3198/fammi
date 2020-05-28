import { v4 as uuidv4 } from 'uuid'; // For version 4
var AWS = require("aws-sdk");

let awsConfig = {
    "region": "ap-southeast-1",
    "endpoint": "dynamodb.ap-southeast-1.amazonaws.com",
    "accessKeyId": "AKIA2MHOP7MJ4LBAR27C",
    "secretAccessKey": "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"
};
AWS.config.update(awsConfig);

var post_list = [];
let docClient = new AWS.DynamoDB.DocumentClient();
//This function is to getting all the items in a table in Dynamo
const data = () => {
    var params = {
        TableName: "posts"
    };
    function onScan(err, data) {

        if (err) {
           // console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            //console.log("Scan succeeded.");
            post_list = JSON.parse(JSON.stringify(data.Items))
            //console.log(post_list)
        }
    }
    const GetUsers = async function () {
        await docClient.scan(params, onScan);
    }

    GetUsers();
    return post_list;
};
data();
//this function is to add an item in a table in Dynamo
const createPost = async function (content,family_key,user,img) {
    var input = {
        "post_id":uuidv4(),
        "content": content,
        "img": img,
        "family_key" : family_key,
        "user":user,
        "time":Date.now(),
        "edit_time":""
    };
    var params = {
        TableName: "posts",
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
//this function is to get an item by id in a table in Dynamo
const readPost = async function (post_id) {
    var params = {
        TableName: "posts",
        Key: {
            "post_id": post_id
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
const updatePost_Content = async function (post_id, content) {
    var params = {
        TableName: "posts",
        Key: {
            "post_id": post_id

        },
        UpdateExpression: "set content = :content, edit_time = :edit_time",
        ExpressionAttributeValues: {
            ":content": content,
            ":edit_time": Date.now()
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
const updatePost_Img = async function (post_id, img) {
    var params = {
        TableName: "posts",
        Key: {
            "post_id": post_id,

        },
        UpdateExpression: "set img = :img",
        ExpressionAttributeValues: {
            ":img": img,
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
const updatePost_Time = async function (post_id, time) {
    var params = {
        TableName: "posts",
        Key: {
            "post_id": post_id,

        },
        UpdateExpression: "set #time = :time",
        ExpressionAttributeValues: {
            ":time": time,
        },
        ExpressionAttributeNames: {
            '#time': 'time'
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
const deletePost = async function (post_id) {
    var params = {
        TableName: "posts",
        Key: {
            "post_id": post_id,
        }
    };
    docClient.delete(params, function (err, data) {
        if (err) {
            //console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            //console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
        }
    });
}
export { createPost,
    readPost,
    updatePost_Content,
    updatePost_Img,
    updatePost_Time,
    deletePost,
    data,
    docClient,
    post_list}
