const responseHandler = require("../common/responsehandler");
const BaseHandler = require("../common/basehandler");
const AWS = require('aws-sdk');
const dynamodb = new AWS.dynamodb();

class GetCustomerbyId extends BaseHandler {
    //this is main function
    constructor() {
        super();
    }

    //validation for cid
    getValidationSchema = () => {
        //validate body schema
        return Joi.object().keys({
            cid: Joi.string().regex(/^[a-zA-Z0-9]*$/).required()
        });
    }

    async process(event, context, callback) {

        try {
            let body = event.body ? JSON.parse(event.body) : event;
            // Validate the input
            await this.validate(body, this.getValidationSchema());

            // Call to get customer
            await this.getCustomer(body.cid);
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

exports.getCustomer = async (event, context, callback) => {
    return await new GetCustomerbyId().handler(event, context, callback);
}