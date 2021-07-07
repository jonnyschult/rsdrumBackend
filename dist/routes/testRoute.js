"use strict";
/*
Users: ~/users
POST /register            => Registers new user account
POST /login               => Logs in a user
GET/getUser               => Get list of users*
GET/getAllUsers           => Get list of users**
PUT/updatePassword        => Updates password *
PUT/updateUser            => Update User Info *
DELETE/removeUser         => Delete user *
*/
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
// import getQueryArgs from "../utilities/getQueryArgsFn";
const testRouter = express_1.Router();
/**********************
 * GET COMMENTS
 *********************/
//  aws dynamodb put-item \
//  --table-name users \
//  --item \
//      '{"id": {"S": "asdf-fdsa-blah-yoyo"}, "email": {"S": "test@test.com"}, "passwordhash": {"S": "testpass"}, "date_of_birth": {"S": "09/12/1989"}, "active": {"BOOL": true}, "student": {"BOOL": true}, "site_admin": {"BOOL": true}, "first_name": {"S": "Jonny"}, "last_name": {"S": "Schult"}}' \
//  --return-consumed-capacity TOTAL \
// --endpoint-url http://localhost:8000
testRouter.get("/testComment", async (req, res) => {
    try {
        var getParams = {
            Key: {
                id: {
                    S: "asdf-fdsa-blah-yoyo",
                },
                category: {
                    S: "comments",
                },
            },
            TableName: "rsdrum",
        };
        const commentsData = await db_1.default.getItem(getParams).promise();
        const commentsList = commentsData.Item.comments_list.L;
        // dynamodb.putItem();
        // const { data } = getComments(userId);
        // const comment = { new: "comment" };
        // putCommentsToDDB(userId, [...data, comment]);
        res.status(200).json({ message: "Test Successful", commentsList });
    }
    catch (error) {
        console.log(error);
        if (error.status < 500) {
            res.status(error.status).json({ message: error.message });
        }
        else if (error.constraint === "users_email_key") {
            //bit hacky, but sends unique error back which is easier to catch on the front end.
            res.status(409).json({ message: "User already exists", error });
        }
        else {
            res.status(500).json({ message: "Internal server error", error });
        }
    }
});
/*****************************
 * CREATE COMMENT
 ****************************/
testRouter.post("/testComment", async (req, res) => {
    try {
        //User is of type User defined in the models
        const info = req.body.info;
        var getParams = {
            Key: {
                id: {
                    S: "asdf-fdsa-blah-yoyo",
                },
                category: {
                    S: "comments",
                },
            },
            TableName: "rsdrum",
        };
        const commentsData = await db_1.default.getItem(getParams).promise();
        if (commentsData.Item !== undefined) {
            const commentsList = commentsData.Item.comments_list.L;
            const updatedListData = {
                id: { S: "asdf-fdsa-blah-yoyo" },
                category: { S: "comments" },
                comments_list: { L: [...commentsList, info] },
            };
            const putParams = {
                Item: updatedListData,
                ReturnConsumedCapacity: "TOTAL",
                TableName: "rsdrum",
            };
            const data = await db_1.default.putItem(putParams).promise();
        }
        else {
            const updatedListData = {
                id: { S: "asdf-fdsa-blah-yoyo" },
                category: { S: "comments" },
                comments_list: { L: [info] },
            };
            const putParams = {
                Item: updatedListData,
                ReturnConsumedCapacity: "TOTAL",
                TableName: "rsdrum",
            };
            const data = await db_1.default.putItem(putParams).promise();
        }
        // const { data } = getComments(userId);
        // const comment = { new: "comment" };
        // putCommentsToDDB(userId, [...data, comment]);
        res.status(200).json({ message: "Test Successful" });
    }
    catch (error) {
        console.log(error);
        if (error.status < 500) {
            res.status(error.status).json({ message: error.message });
        }
        else if (error.constraint === "users_email_key") {
            //bit hacky, but sends unique error back which is easier to catch on the front end.
            res.status(409).json({ message: "User already exists", error });
        }
        else {
            res.status(500).json({ message: "Internal server error", error });
        }
    }
});
/*****************************
 * UPDATE USER INFO
 ****************************/
testRouter.put("/testComment", async (req, res) => {
    try {
        //User is of type User defined in the models
        const info = req.body.info;
        var getParams = {
            Key: {
                id: {
                    S: "asdf-fdsa-blah-yoyo",
                },
                category: {
                    S: "comments",
                },
            },
            TableName: "rsdrum",
        };
        const commentsData = await db_1.default.getItem(getParams).promise();
        if (commentsData.Item !== undefined) {
            const commentsList = commentsData.Item.comments_list.L;
            const updatedListData = {
                id: { S: "asdf-fdsa-blah-yoyo" },
                category: { S: "comments" },
                comments_list: { L: [...commentsList, info] },
            };
            const putParams = {
                Item: updatedListData,
                ReturnConsumedCapacity: "TOTAL",
                TableName: "rsdrum",
            };
            const data = await db_1.default.updateItem(putParams).promise();
        }
        else {
            throw Error;
        }
        res.status(200).json({ message: "Test Successful" });
    }
    catch (error) {
        console.log(error);
        if (error.status < 500) {
            res.status(error.status).json({ message: error.message });
        }
        else if (error.constraint === "users_email_key") {
            //bit hacky, but sends unique error back which is easier to catch on the front end.
            res.status(409).json({ message: "User already exists", error });
        }
        else {
            res.status(500).json({ message: "Internal server error", error });
        }
    }
});
/*****************************
 * DELETE USER
 ****************************/
testRouter.delete("/testComment", async (req, res) => {
    try {
        const params = {
            Key: {
                id: {
                    S: "asdf-fdsa-blah-yoyo",
                },
                category: {
                    S: "comments",
                },
            },
            TableName: "rsdrum",
        };
        const data = await db_1.default.deleteItem(params, () => { });
        console.log(data);
        res.status(200).json({ message: "Test deletion successful" });
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
exports.default = testRouter;
