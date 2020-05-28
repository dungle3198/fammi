import { v4 as uuidv4 } from 'uuid'; // For version 4

var AWS = require("aws-sdk");

let awsConfig = {
    "region": "ap-southeast-1",
    "endpoint": "dynamodb.ap-southeast-1.amazonaws.com",
    "accessKeyId": "AKIA2MHOP7MJ4LBAR27C",
    "secretAccessKey": "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"
};
AWS.config.update(awsConfig);

var event_list = [];
let docClient = new AWS.DynamoDB.DocumentClient();
//This function is to getting all the items in a table in Dynamo
const data = () => {
    var params = {
        TableName: "events"
    };
    function onScan(err, data) {

        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            //console.log("Scan succeeded.");
            event_list = JSON.parse(JSON.stringify(data.Items))
        }
    }
    const GetUsers = async function () {
        await docClient.scan(params, onScan);
    }

    GetUsers();
    return event_list;
};
data();
//this function is to add an item in a table in Dynamo
const createEvent = async function (title, description, start, end,family_key) {
    var input = {
        "event_id":uuidv4(),
        "title": title,
        "description": description,
        "start": start,
        "end": end,
        "family_key" : family_key
    };
    var params = {
        TableName: "events",
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
const readEvent = async function (event_id) {
    var params = {
        TableName: "events",
        Key: {
            "event_id": event_id
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
const updateEvent_Title = async function (event_id, title) {
    var params = {
        TableName: "events",
        Key: {
            "event_id": event_id,

        },
        UpdateExpression: "set title = :title",
        ExpressionAttributeValues: {
            ":title": title,
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
//this function is to update an item in a table in Dynamo
const updateEvent_Description = async function (event_id, description) {
    var params = {
        TableName: "events",
        Key: {
            "event_id": event_id,

        },
        UpdateExpression: "set description = :description",
        ExpressionAttributeValues: {
            ":description": description,
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
const updateEvent_StartDate = async function (event_id, start) {
    var params = {
        TableName: "events",
        Key: {
            "event_id": event_id,

        },
        UpdateExpression: "set #start = :start",
        ExpressionAttributeValues: {
            ":start": start,
        },
        ExpressionAttributeNames: {
            '#start': 'start'
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
const updateEvent_EndDate = async function (event_id, end) {
    var params = {
        TableName: "events",
        Key: {
            "event_id": event_id,

        },
        UpdateExpression: "set #end = :end",
        ExpressionAttributeValues: {
            ":end": end,
        },
        ExpressionAttributeNames: {
            '#end': 'end'
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
const deleteEvent = async function (event_id) {
    var params = {
        TableName: "events",
        Key: {
            "event_id": event_id,
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
export { createEvent,
    readEvent,
    updateEvent_Title,
    updateEvent_Description,
    updateEvent_StartDate,
    updateEvent_EndDate,
    deleteEvent,
    data,
    event_list}
