"use strict";

const AWS = require("aws-sdk");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, _, callback) => {
  var params = {
    TableName: process.env.DYNAMODB_TABLE,
  };

  // This handler accepts `coffeShopId` or `userId` as input to
  // simulate how the data could be fetched depending on the
  // authenticated user / api-key.
  //
  // If the request comes from a CoffeShop terminal, the handler 
  // will fetch only the order for that shop by querying by `CoffeShopIdIndex`
  //
  // If the request comes from a end customer terminal, the handler
  // will fetch only the orders made by that customer querying by `UserIdIndex`
  //
  // If no `queryStringParameters` are provided, the handler will
  // fetch and return all the orders.
  if (event.queryStringParameters != null) {
    if (
      typeof event.queryStringParameters.coffeShopId === "string" &&
      event.queryStringParameters.coffeShopId.length !== 0
    ) {
      params.IndexName = "CoffeShopIdIndex";
      params.KeyConditionExpression = "coffeShopId = :coffeShopId";
      params.ExpressionAttributeValues = {
        ":coffeShopId": event.queryStringParameters.coffeShopId,
      };
    } else if (
      typeof event.queryStringParameters.userId === "string" &&
      event.queryStringParameters.userId.length !== 0
    ) {
      params.IndexName = "UserIdIndex";
      params.KeyConditionExpression = "userId = :userId";
      params.ExpressionAttributeValues = {
        ":userId": event.queryStringParameters.userId,
      };
    }
  }

  if (params.IndexName == null) {
    // fetch all orders from the database
    dynamoDb.scan(params, (error, result) => {
      // handle potential errors
      if (error) {
        console.error(error);
        callback(null, {
          statusCode: error.statusCode || 501,
          headers: { "Content-Type": "text/plain" },
          body: "Couldn't fetch the orders.",
        });
        return;
      }

      console.log(result);
      // create a response
      const response = {
        statusCode: 200,
        body: JSON.stringify({ data: result.Items }),
      };
      callback(null, response);
    });
  } else {
    // query all orders from a specific index
    dynamoDb.query(params, (error, result) => {
      // handle potential errors
      if (error) {
        console.error(error);
        callback(null, {
          statusCode: error.statusCode || 501,
          headers: { "Content-Type": "text/plain" },
          body: "Couldn't fetch the orders.",
        });
        return;
      }

      console.log(result);
      // create a response
      const response = {
        statusCode: 200,
        body: JSON.stringify({ data: result.Items }),
      };
      callback(null, response);
    });
  }
};
