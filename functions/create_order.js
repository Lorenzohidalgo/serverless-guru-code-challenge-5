"use strict";

const uuid = require("uuid");
const AWS = require("aws-sdk");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, _, callback) => {
  const ISODateTime = new Date().toISOString();
  const data = JSON.parse(event.body);
  if (
    !(typeof data.coffeShopId === "string" && data.coffeShopId.length !== 0) ||
    !(typeof data.userId === "string" && data.userId.length !== 0) ||
    !(typeof data.order === "string" && data.order.length !== 0)
  ) {
    console.error("Validation Failed");
    callback(null, {
      statusCode: 400,
      headers: { "Content-Type": "text/plain" },
      body: "Validation Failed. Couldn't create the order item.",
    });
    return;
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      id: uuid.v1(),
      userId: data.userId,
      coffeShopId: data.coffeShopId,
      order: data.order,
      status: "OPEN",
      createdAt: ISODateTime,
      updatedAt: ISODateTime,
    },
  };

  // write the oreder to the database
  dynamoDb.put(params, (error) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { "Content-Type": "text/plain" },
        body: "Couldn't create the order item.",
      });
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify({ data: params.Item }),
    };
    callback(null, response);
  });
};
