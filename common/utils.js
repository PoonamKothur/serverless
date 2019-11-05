const Extension = require('joi-date-extensions');
const BaseJoi = require('joi');
const Joi = BaseJoi.extend(Extension);

// This function is used to validate json against a schema
exports.validate = async (json,schema) =>{
    return new Promise((resolve, reject) => {
        Joi.validate(json, schema, {
            abortEarly: false
        }, function (err, value) {
            if (err) {
                console.log("err",err);
                reject({ statusCode: 400, message: err.details});
            }
            else {
                resolve(value);
            }
        });
    });
};

// This method is used to group array by the key
exports.groupBy = (array, key) => {
    return array.reduce((acc, curr) => {
        if (!acc[curr[key]]) acc[curr[key]] = [];
        acc[curr[key]].push(curr);
        return acc;
    }, {});

};

// This method is used to group array by the key
exports.groupByKey = (array, key) => {
    return array.reduce((acc, curr) => {
        acc[curr[key]]=curr;
        return acc;
    }, {});

};