"use strict";

const AWS = require("aws-sdk");

const PossibleOrderStatus = ["OPEN", "INPROGRESS", "READY", "CLOSED"];

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, _, callback) => {
  const ISODateTime = new Date().toISOString();
  const data = JSON.parse(event.body);

  // We validate the input of mandatory fields
  // The id should be a non-empty String
  // The new status should be one of the approved ones `PossibleOrderStatus`
  if (
    !(
      typeof data.status === "string" &&
      PossibleOrderStatus.includes(data.status)
    ) ||
    !(
      typeof event.pathParameters.id === "string" &&
      event.pathParameters.id.length !== 0
    )
  ) {
    console.error("Validation Failed");
    callback(null, {
      statusCode: 400,
      headers: { "Content-Type": "text/plain" },
      body: "Validation Failed. Couldn't update the order item.",
    });
    return;
  }

  // We prepare the parameters to update the record.
  // `updatedAt` is also updated.
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: event.pathParameters.id,
    },
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":status": data.status,
      ":updatedAt": ISODateTime,
    },
    UpdateExpression: "SET #status = :status, updatedAt = :updatedAt",
    ReturnValues: "ALL_NEW",
  };

  // update the order in the database
  dynamoDb.update(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { "Content-Type": "text/plain" },
        body: "Couldn't fetch the todo item.",
      });
      return;
    }

    console.log(result);
    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify({ data: result.Attributes }),
    };
    callback(null, response);
  });
};
