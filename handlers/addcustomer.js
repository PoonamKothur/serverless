const responseHandler = require("../common/responsehandler");
const BaseHandler = require("../common/basehandler");
const Joi = require('joi');
const AWS = require('aws-sdk');
const dynamodb = new AWS.dynamodb();

class AddCustomer extends BaseHandler {
    //this is main function
    constructor() {
        super();
    }

    generateRandomcid = (min, max) => {
        return (Math.random().toString(36).substring(min, max) + Math.random().toString(36).substring(min, max)).toUpperCase();
    }

    getValidationSchema = () => {
        //validate body schema
        return Joi.object().keys({
            cid: Joi.string().required(),
            cuid: Joi.string().required(),
            type: Joi.string().valid(['Consumer', 'Enterprise']).required(),
            scope: Joi.string().valid(['Direct', 'Reseller']).required(),
            customerEmail: Joi.string().email().required(),
            primary: {
                firstName: Joi.string().required(),
                lastName: Joi.string().required(),
                email: Joi.string().email().required(),
                phone: Joi.string().phoneNumber().required()
            },
            secondary: {
                firstName: Joi.string(),
                lastName: Joi.string(),
                email: Joi.string().email(),
                phone: Joi.string().phoneNumber(),
                registration: Joi.date().optional(),
                lastUpdate: Joi.date().optional()
            }
        });
    }

    // This function is used to get customer by cid
    async checkIfCustomerExists(cid) {
        let response = await dynamodb.query({
            TableName: `customer-${process.env.STAGE}`,
            Key: {
                cid: cid
            },
            ProjectionExpression: 'cid'
        }).promise();
        if (response) {
            return true;
        }
        return false;
    }

    //values insert if customer does not exists
    insertCustomer = async (body) => {

        let item = {
            cid: this.generateRandomcid()
        }
        const params = {
            TableName: `customer-${process.env.STAGE}`,
            Item: Object.assign(item, body)
        };
        return dynamodb.put(params).promise();
    }

    // This function calls lambda to create customer specific resources
    //validation for resources

    /*async createCustomerResources(cid) {

    }*/

    async process(event, context, callback) {

        try {
            let body = event.body ? JSON.parse(event.body) : event;
            // Validate the input
            await this.validate(body, this.getValidationSchema());

            // Check if cid already exists
            let customerExists = this.checkIfCustomerExists(body.cid);
            if (customerExists) {
                return responseHandler.callbackRespondWithSimpleMessage('400', 'Duplicate customer');
            }

            // Call to insert customer
            await this.insertCustomer(body);

            //call insert customerresorces
            await this.createCustomerResources(body.cid);
            return responseHandler.callbackRespondWithSimpleMessage(200, ' Customer Created Successfully ');
        }

        catch (err) {
            console.log(err);
            if (err.message) {
                return responseHandler.callbackRespondWithSimpleMessage(400, err.message);
            } else {
                return responseHandler.callbackRespondWithSimpleMessage(500, 'Internal Server Error')
            }
        }
    };
}

exports.createcustomer = async (event, context, callback) => {
    return await new AddCustomer().handler(event, context, callback);
}