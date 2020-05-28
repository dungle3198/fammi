import { v4 as uuidv4 } from 'uuid'; // For version 4
var AWS = require("aws-sdk");

let awsConfig = {
    "region": "ap-southeast-1",
    "endpoint": "dynamodb.ap-southeast-1.amazonaws.com",
    "accessKeyId": "AKIA2MHOP7MJ4LBAR27C",
    "secretAccessKey": "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"
};
AWS.config.update(awsConfig);

var todolist_list = [];
let docClient = new AWS.DynamoDB.DocumentClient();
//This function is to getting all the items in a table in Dynamo
const data = () => {
    var params = {
        TableName: "todolist"
    };
    function onScan(err, data) {

        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            //console.log("Scan succeeded.");
            todolist_list = JSON.parse(JSON.stringify(data.Items))
        }
    }
    const GetUsers = async function () {
        await docClient.scan(params, onScan);
    }

    GetUsers();
    return todolist_list;
};
data();
//this function is to add an item in a table in Dynamo
const createTodolist = async function (title, elements,family_key,user) {
    var input = {
        "todolist_id": uuidv4(),
        "title": title,
        "elements": elements,
        "family_key":family_key,
        "user":user,
        "status": "Created",
        "time":Date.now()
    };
    var params = {
        TableName: "todolist",
        Item: input
    };
    console.log(input);
    docClient.put(params, function (err, data) {

        if (err) {
            console.log("users::save::error - " + JSON.stringify(err, null, 2));
        } else {
            // console.log("users::save::success");
        }
    })
}
//this function is to get an item by id in a table in Dynamo
const readTodolist = async function (todolist_id) {
    var params = {
        TableName: "todolist",
        Key: {
            "todolist_id": todolist_id
        }
    };
    docClient.get(params, function (err, data) {
        if (err) {
            console.log("users::fetchOneByKey::error - " + JSON.stringify(err, null, 2));
        }
        else {
            // console.log("users::fetchOneByKey::success - " + JSON.stringify(data, null, 2));
        }
        return JSON.parse(JSON.stringify(data));
    })
}
//this function is to update an item in a table in Dynamo
const updateToDoList_Title = async function (todolist_id, title) {
    var params = {
        TableName: "todolist",
        Key: {
            "todolist_id": todolist_id,

        },
        UpdateExpression: "set title = :title",
        ExpressionAttributeValues: {
            ":title": title,
        },
        ReturnValues: "UPDATED_NEW"
    };
    docClient.update(params, function (err, data) {

        if (err) {
            console.log("users::save::error - Title" + JSON.stringify(err, null, 2));
        } else {
            console.log("users::save::success");
        }
    });
}
const updateToDoList_Status = async function (todolist_id) {
    var params = {
        TableName: "todolist",
        Key: {
            "todolist_id": todolist_id,

        },
        UpdateExpression: "set status = :status",
        ExpressionAttributeValues: {
            ":status": "Edited",
        },
        ReturnValues: "UPDATED_NEW"
    };
    docClient.update(params, function (err, data) {

        if (err) {
            console.log("users::save::error - Status" + JSON.stringify(err, null, 2));
        } else {
            console.log("users::save::success");
        }
    });
}
const updateToDoList_Time = async function (todolist_id) {
    var params = {
        TableName: "todolist",
        Key: {
            "todolist_id": todolist_id,

        },
        UpdateExpression: "set #time = :time",
        ExpressionAttributeValues: {
            ":time": Date.now(),
        },
        ExpressionAttributeNames: {
            '#time': 'time'
          },
        ReturnValues: "UPDATED_NEW"
    };
    docClient.update(params, function (err, data) {

        if (err) {
            console.log("users::save::error - Time" + JSON.stringify(err, null, 2));
        } else {
            console.log("users::save::success");
        }
    });
}
const updateToDoList_Elements = async function (todolist_id, elements) {
    var params = {
        TableName: "todolist",
        Key: {
            "todolist_id": todolist_id,

        },
        UpdateExpression: "set elements = :elements",
        ExpressionAttributeValues: {
            ":elements": elements,
        },
        ReturnValues: "UPDATED_NEW"
    };
    docClient.update(params, function (err, data) {

        if (err) {
            console.log("users::save::error - Elements" + JSON.stringify(err, null, 2));
        } else {
            console.log("users::save::success");
        }
    });
}
const deleteTodolist = function (todolist_id) {
    var params = {
        TableName: "todolist",
        Key: {
            "todolist_id": todolist_id,
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
export {
    docClient,
    data,
    createTodolist,
    readTodolist,
    updateToDoList_Title,
    updateToDoList_Elements,
    updateToDoList_Status,
    updateToDoList_Time,
    deleteTodolist,
    todolist_list
}