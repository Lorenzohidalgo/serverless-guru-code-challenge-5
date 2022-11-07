"use strict";

const AWS = require("aws-sdk");

module.exports.handler = (event, _, __) => {
  for (let i = 0; i < event.Records.length; i++) {
    const record = event.Records[i];

    const parsedRecord = {
      new: AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage),
      old: AWS.DynamoDB.Converter.unmarshall(record.dynamodb.OldImage),
    };

    switch (record["eventName"]) {
      case "INSERT":
        console.log(`Coffee Shop(${parsedRecord.new.coffeShopId}) should be notified of the new order(${parsedRecord.new.order})!`);
        break;
      case "MODIFY":
        console.log(`User(${parsedRecord.new.userId}) should be notified of the update on its order(${parsedRecord.new.order})!`);
        break;
      case "REMOVE":
        console.log("Deleted Order Event");
        break;
      default:
        break;
    }
  }
};
