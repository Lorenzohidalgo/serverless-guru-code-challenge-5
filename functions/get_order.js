"use strict";

const AWS = require("aws-sdk");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, _, callback) => {
  if (
    !(
      typeof event.pathParameters.id === "string" &&
      event.pathParameters.id !== 0
    )
  ) {
    console.error("Validation Failed");
    callback(null, {
      statusCode: 400,
      headers: { "Content-Type": "text/plain" },
      body: "Validation Failed. Couldn't get the order item.",
    });
    return;
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: event.pathParameters.id,
    },
  };

  // fetch order from the database
  dynamoDb.get(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { "Content-Type": "text/plain" },
        body: "Couldn't fetch the order item.",
      });
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify({ data: result.Item }),
    };
    callback(null, response);
  });
};
