# Hi there Serverless-Guru Team, I'm Lorenzo 👋

## Objectives

This repository has been created to solve the code challenge sent by the Serverless-Guru Team before starting the interview process.

For this occasion, the challenge proposed was [challenge 5](https://github.com/serverless-guru/code-challenges/blob/master/code-challenge-5/README.md): AWS API Gateway CRUD REST API


The main tasks that composed the challenge were:
1. Create a CRUD REST API using the [Serverless Framework](https://www.serverless.com/)
2. Configure a CI/CD Pipeline with GithubActions
3. Record and share a video explaining the generated solution


## Approach

To solve (and spice a bit up) the current challenge I've made the project fit the use-case of a Coffee Ordering App.

The basic requirements where:
* CRUD API to manage coffee shop orders.
* Stream Observer to simulate triggering "notifications" or events based on data changes.


## Repository Structure

The main files and folders of this repository are:
* **.github/workflows**: Used to store both actions to automatically deploy changes to the `dev` and `prod` stages.
* **functions**: Used to store all lambda function code files.
* **CHALLENGE.md**: A copy of the proposed challenge.
* **package.json**: Project dependencies
* **serverless.yaml**: Main configuration file


## Project/App Structure

The developed project is composed of six AWS Lambda Functions and one DynamoDB Table.

### DynamoDB Table

A DynamoDB Table is used to store the necessary data for this project, with its name being automatically generated as `${self:service}-${sls:stage}-OrdersTable`. 

The table has been configured with a `Primary Key` on the `id` Attribute and two `Global Secondary Indexes`:
* UserIdIndex: Where the Attribute `userId` is used as the key and `createdAt` as a sorting key.
* CoffeShopInde:  Where the Attribute `coffeShopId` is used as the key and `createdAt` as a sorting key.

A Stream has been configured to stream all changes made to the data.

All records in the table should have the following Attributes (all Strings):
* **id**: To identify a specific order, automatically assigned on creation
* **userId**: To identify a specific user
* **coffeShopId**: To identify the Coffee Shop where the order has been placed
* **order**: Text specifying the order
* **status**: To identify the current status, should be one of the following ones `["OPEN", "INPROGRESS", "READY", "CLOSED"]`
* **createdAt**: ISO String of the creation Date
* **updatedAt**: ISO String of the last update Date



### Lambda Functions


#### 1. Create

The lambda function that handles the record creation is located at `functions/create_order.js` and is triggered by the API GateWay when a `POST` call is made to the `/orders` path.

The `POST` call `body` should include the following `String` variables:
coffeShopId: Coffee Shop ID
* **userId**: User ID
* **order**: Text with your order

If any of the above-mentioned variables are missing, is not a String, or is an empty String, a `Status Code: 400` is returned.

The handler will automatically add the following variables before creating the record:
* **id**: To identify the order
* **status**: Set to `OPEN`
* **createdAt**: ISO String of the creation Date
* **updatedAt**: ISO String of the creation Date

If the record is saved successfully, a `Status Code: 200` is returned. Otherwise, a `Status Code: 501` or the `DynamoDB error code` is returned.


#### 2. List

The lambda function that handles the record fetching is located at `functions/list_order.js` and is triggered by the API GateWay when a `GET` call is made to the `/orders` path.

By default, the handler will return a list of all orders and a `Status Code: 200`. If there was any issue while fetching the data, a `Status Code: 501` or the `DynamoDB error code` is returned.

To "spice" the handler up and make it a little more interesting, we have simulated how the same function could return the data depending on the requesting identity.

The handler currently uses query string parameters to simulate the behavior:
* **Normal customer**: if the call is made passing the `userId` as a query parameter, the handler will query the index `UserIdIndex` and only return the orders of that customer.
* **Coffee Shop**: if the call is made passing the `coffeShopId` as a query parameter, the handler will query the index `CoffeShopIdIndex` and return all orders made to that specific shop.

The same behavior could be applied by identifying the requesting entity based on the authorization token or API key.


#### 3. Get

The lambda function that handles the record fetching by id is located at `functions/get_order.js` and is triggered by the API GateWay when a `GET` call is made to the `/orders/{id}` path.

If the provided `id` is not a String or is an empty string, a `Status Code: 400` is returned.

By default, the handler will return the fetched order and a `Status Code: 200`. If there was any issue while fetching the data, a `Status Code: 501` or the `DynamoDB error code` is returned.



#### 4. Update

The lambda function that handles updating the records is located at `functions/update_order.js` and is triggered by the API GateWay when a `PUT` call is made to the `/orders/{id}` path.

If the provided `id` is not a String or is an empty string, a `Status Code: 400` is returned.

The `PUT` call `body` should include the following `String` variables:
* **status**: order status, should be one of the following ones `["OPEN", "INPROGRESS", "READY", "CLOSED"]`

If the above-mentioned variable is missing, is not a String or is an empty String, or is not one of the valid Order Status, a `Status Code: 400` is returned.

If the record was updated successfully, the handler will return the updated order and a `Status Code: 200`. If there was any issue while updating the data, a `Status Code: 501` or the `DynamoDB error code` is returned.


#### 5. Delete

The lambda function that handles the record deletion is located at `functions/delete_order.js` and is triggered by the API GateWay when a `DELETE` call is made to the `/orders/{id}` path.

If the provided `id` is not a String or is an empty string, a `Status Code: 400` is returned.

If the record was updated successfully, the handler will return a `Status Code: 200`. If there was any issue while updating the data, a `Status Code: 501` or the `DynamoDB error code` is returned.


#### 6. Update Observer

The lambda function that listens to the DynamoDB Stream is located at `functions/observe_order.js` and is triggered by any change made to the Orders Table.

This Function is a proof of concept of how one could use a DynamoDB Stream and a Lambda function to react to events/changes made to the data.

For Example, we could replace the current `console.log` statements to trigger push or email notifications to the users based on the different events:
* **New Record**: The Coffee Shop should be notified that a new order has been made.
* **Updated Record**: The end user should be notified that the status of its order has changed


## CI/CD Pipeline

As per the challenges requisites, the CI/CD Pipeline has been configured using GitHub Actions.

Two different actions have been developed and can be located in the `.github/workflows` folder:
deploy-dev-app.yaml: To deploy the application to the Development Stage
deploy-prod-app.yaml: To deploy the application to the Production Stage.

The main difference between both files is teh trigger and the value passed as `--stage` when executing the `deploy` command, but have been kept in different files since they would have more differences on a real life project.

A `push` to `deploy-dev` or `deploy-prod` branches is needed to trigger the deploy CI/CD Pipeline.