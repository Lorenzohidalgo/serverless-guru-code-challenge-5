"use strict";

const AWS = require("aws-sdk");

// This handler is triggered by a dynamoDB stream,
// a single event could have the changes made to up to 100 records
//
// This handler is an example of how one could use a dynamoDB Stream
// and a Lambda function to react to events/changes made to the data.
//
// For Example: we could replace the current `console.log` statements
// to trigger push or email notifications to the users
module.exports.handler = (event, _, __) => {
  for (let i = 0; i < event.Records.length; i++) {
    const record = event.Records[i];

    // Parses the current record so that one can access the new record
    // via `parsedRecord.new` or the old record via `parsedRecord.old`
    const parsedRecord = {
      new: AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage),
      old: AWS.DynamoDB.Converter.unmarshall(record.dynamodb.OldImage),
    };

    switch (record["eventName"]) {
      case "INSERT":
        // This part will be executed every time a new record is created.
        // We could use this to notify the CoffeShop of the new order.
        console.log(
          `Coffee Shop(${parsedRecord.new.coffeShopId}) should be notified of the new order(${parsedRecord.new.order})!`
        );
        break;
      case "MODIFY":
        // This part will be executed evry time a record is updated.
        // We could use it to notify the user of changes in the status of its order.
        console.log(
          `User(${parsedRecord.new.userId}) should be notified of the update on its order(${parsedRecord.new.order})!`
        );
        break;
      case "REMOVE":
        console.log("Deleted Order Event");
        break;
      default:
        break;
    }
  }
};
