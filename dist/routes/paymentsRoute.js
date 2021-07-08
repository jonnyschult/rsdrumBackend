"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_1 = require("express");
// const stripe = require("stripe")(process.env.STRIPE_SECRET);
const stripe_1 = __importDefault(require("stripe"));
const db_1 = __importDefault(require("../db"));
const userValidation_1 = __importDefault(require("../middleware/userValidation"));
const uuid_1 = require("uuid");
const models_1 = require("../models");
const utilities_1 = require("../utilities");
const paymentRouter = express_1.Router();
/***************************
 * CREATE PAYMENT INTENT
 **************************/
paymentRouter.post("/createPaymentIntent", userValidation_1.default, async (req, res) => {
    try {
        //Get package info
        const info = req.body.info;
        //Create stripe instance
        const stripe = new stripe_1.default(process.env.STRIPE_SECRET, { apiVersion: "2020-08-27" });
        const getParams = {
            TableName: "rsdrum",
            Key: {
                category: "packages",
                id: info.packageId,
            },
        };
        const results = await db_1.default.get(getParams).promise();
        const selectedPackage = results.Item.info;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: +info.quantity * +selectedPackage.price,
            currency: "usd",
        });
        res.status(200).json({ message: "Success. Payment information saved.", paymentIntent });
    }
    catch (error) {
        console.log(error);
        if (error.status < 500) {
            res.status(error.status).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Internal server error", error });
        }
    }
});
/***************************
 * SAVE PAYMENT INFO
 **************************/
paymentRouter.post("/savePayment", userValidation_1.default, async (req, res) => {
    try {
        //Get assignment info
        const info = req.body.info;
        info.id = uuid_1.v4();
        const putParams = {
            TableName: "rsdrum",
            Item: {
                category: "payments",
                id: info.id,
                info: info,
            },
        };
        await db_1.default.put(putParams).promise();
        const receipt = info;
        res.status(200).json({ message: "Success. Payment information saved.", receipt });
    }
    catch (error) {
        console.log(error);
        if (error.status < 500) {
            res.status(error.status).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Payment made, but receipt failed to generate.", error });
        }
    }
});
/***************************
 * CREATE PACKAGE
 **************************/
paymentRouter.post("/createPackage", userValidation_1.default, async (req, res) => {
    try {
        //Get info object from query params
        const info = req.body.info;
        const user = req.user;
        if (!user.admin) {
            throw new models_1.CustomError(401, "Must be admin to perform this action");
        }
        //create unique id
        info.id = uuid_1.v4();
        //Create package Object in DynamoDB
        const putParams = {
            Item: {
                category: "packages",
                id: info.id,
                info: info,
            },
            ReturnConsumedCapacity: "TOTAL",
            TableName: "rsdrum",
        };
        await db_1.default.put(putParams).promise();
        res.status(200).json({ message: "Success.", newPackage: info });
    }
    catch (error) {
        console.log(error);
        if (error.status < 500) {
            res.status(error.status).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Internal server error", error });
        }
    }
});
/***************************
 * GET PACKAGES
 **************************/
paymentRouter.get("/getPackages", async (req, res) => {
    try {
        //Get info object from query params
        const packageId = req.query.id;
        let packages;
        if (packageId !== undefined) {
            const getParams = {
                TableName: "rsdrum",
                Key: {
                    category: "packages",
                    id: packageId,
                },
            };
            const results = await db_1.default.get(getParams).promise();
            packages = [results.Item.info];
        }
        else {
            const queryParams = {
                TableName: "rsdrum",
                KeyConditionExpression: "#category = :packages",
                ExpressionAttributeNames: { "#category": "category" },
                ExpressionAttributeValues: { ":packages": "packages" },
                ConsistentRead: true,
            };
            const queryResults = await db_1.default.query(queryParams).promise();
            packages = queryResults.Items.map((dbEntry) => dbEntry.info);
        }
        res.status(200).json({ message: "Success.", packages });
    }
    catch (error) {
        console.log(error);
        if (error.status < 500) {
            res.status(error.status).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Internal server error", error });
        }
    }
});
/***************************
 * GET RECEIPTS
 **************************/
paymentRouter.get("/getReceipts", userValidation_1.default, async (req, res) => {
    try {
        //Get info object from query params
        const info = req.query;
        const user = req.user;
        let receipts;
        if (Object.entries(info).length > 0) {
            let infoProp = Object.keys(info)[0];
            const infoValue = utilities_1.typeConverter(Object.values(info)[0]);
            if (infoProp === "id") {
                const getParams = {
                    TableName: "rsdrum",
                    Key: {
                        category: "payments",
                        id: infoValue,
                    },
                };
                const results = await db_1.default.get(getParams).promise();
                receipts = [results.Item.info];
            }
            else {
                const queryParams = {
                    TableName: "rsdrum",
                    KeyConditionExpression: "#category = :payments",
                    FilterExpression: "#info.#prop = :val",
                    ExpressionAttributeNames: { "#category": "category", "#info": "info", "#prop": infoProp },
                    ExpressionAttributeValues: { ":payments": "payments", ":val": infoValue },
                };
                const queryResults = await db_1.default.query(queryParams).promise();
                receipts = queryResults.Items.map((dbItem) => dbItem.info);
            }
        }
        else {
            const queryParams = {
                TableName: "rsdrum",
                KeyConditionExpression: "#category = :payments",
                ExpressionAttributeNames: { "#category": "category" },
                ExpressionAttributeValues: { ":payments": "payments" },
                ConsistentRead: true,
            };
            const queryResults = await db_1.default.query(queryParams).promise();
            receipts = queryResults.Items.map((dbItem) => dbItem.info);
        }
        if (receipts[0] !== undefined && receipts[0].userId !== user.id && !user.admin) {
            throw new models_1.CustomError(401, "Must be site admin, or own this data to gain access.");
        }
        res.status(200).json({ message: "Success.", receipts });
    }
    catch (error) {
        console.log(error);
        if (error.status < 500) {
            res.status(error.status).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Internal server error", error });
        }
    }
});
/*****************************
UPDATE PACKAGE
****************************/
paymentRouter.put("/updatePackage", userValidation_1.default, // Validates user and gives us req.user property
async (req, res) => {
    try {
        //Information to pass to UPDATE DB
        const info = req.body.info;
        const packageId = req.body.id;
        //Get user info from validation
        const user = req.user;
        console.log(req.body);
        if (!user.admin) {
            throw new models_1.CustomError(401, "Request failed. Admin privileges required.");
        }
        const updateInfo = utilities_1.updateParamsFn(info);
        const updateParams = {
            TableName: "rsdrum",
            Key: {
                category: "packages",
                id: packageId,
            },
            UpdateExpression: updateInfo.setString,
            ExpressionAttributeValues: updateInfo.exAttVals,
            ReturnValues: "UPDATED_NEW",
        };
        const updatedPackageData = await db_1.default.update(updateParams).promise();
        const updatedPackage = updatedPackageData.Attributes.info;
        res.status(200).json({ message: "Package Updated", updatedPackage });
    }
    catch (error) {
        console.log(error);
        if (error.status < 500) {
            res.status(error.status).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Internal server error", error });
        }
    }
});
/*****************************
 * DELETE PACKAGE
 ****************************/
paymentRouter.delete("/deletePackage/:id", userValidation_1.default, async (req, res) => {
    try {
        //Id of user to delete
        const packageId = req.params.id;
        //Get user set in validation session
        const user = req.user;
        //Throw an error if user is not admin
        if (!user.admin) {
            throw new models_1.CustomError(401, "Must be admin to perform this action");
        }
        const params = {
            Key: {
                category: "packages",
                id: packageId,
            },
            TableName: "rsdrum",
            ReturnValues: "ALL_OLD",
        };
        const deletionData = await db_1.default.delete(params, () => { }).promise();
        const deletedPackage = deletionData.Attributes;
        if (deletedPackage === undefined) {
            throw new models_1.CustomError(404, "Package not found. Deletion failed.");
        }
        res.status(200).json({ message: "Package Deleted", deletedPackage });
    }
    catch (error) {
        console.log(error);
        if (error.status < 500) {
            res.status(error.status).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Internal server error", error });
        }
    }
});
exports.default = paymentRouter;
