const responseHandler = require("../common/responsehandler");
const BaseHandler = require("../common/basehandler");
const AWS = require('aws-sdk');
const Joi = require('joi');
const utils = require('../common/utils');
const documentClient = new AWS.DynamoDB.DocumentClient();

class GetCustomerbyId extends BaseHandler {
    //this is main function
    constructor() {
        super();
    }

    //validation for cid
    getValidationSchema() {
        //validate body schema
        return Joi.object().keys({
            cid: Joi.string().regex(/^[a-zA-Z0-9]*$/).required()
        });
    }

    async getCustomerBycid(cid) {

        const params = {
            TableName: 'customer'
        };
      
        return this.documentClient.get(params).promise();

        /*let valRes = await this.dynamoDb.query(params).promise();
        let flag = false;
        if (valRes && 'Item' in valRes && valRes.Item && 'id' in valRes.Item && valRes.Item.id) {
            flag = true;
            return valRes;
        } else {
            return flag;
        }*/
    }

    async process(event, context, callback) {

        try {
            let body = event.body ? JSON.parse(event.body) : event;

            // Validate the input
            await utils.validate(body, this.getValidationSchema());

            // Call to get customer
            await this.getCustomerBycid(body.cid);
            return responseHandler.callbackRespondWithSimpleMessage(200, ' Customer Returned Successfully ');
        }

        catch (err) {
            console.log(err);
            if (err.message) {
                return responseHandler.callbackRespondWithSimpleMessage(400, err.message);
            } else {
                return responseHandler.callbackRespondWithSimpleMessage(500, 'Internal Server Error')
            }
        }
    }
}

exports.getcustomer = async (event, context, callback) => {
    return await new GetCustomerbyId().handler(event, context, callback);
}