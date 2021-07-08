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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const db_1 = __importDefault(require("../db"));
const userValidation_1 = __importDefault(require("../middleware/userValidation"));
const models_1 = require("../models");
const utilities_1 = require("../utilities");
// import getQueryArgs from "../utilities/getQueryArgsFn";
const usersRouter = express_1.Router();
/**********************
 * REGISTER USER
 *********************/
usersRouter.post("/register", async (req, res) => {
    try {
        const info = req.body.info;
        if (info.password.length < 8) {
            throw new models_1.CustomError(406, "Password less than 8 characters long");
        }
        const queryParams = {
            TableName: "rsdrum",
            KeyConditionExpression: "#category = :userInfo",
            FilterExpression: "#info.email = :userEmail",
            ExpressionAttributeNames: { "#info": "info", "#category": "category" },
            ExpressionAttributeValues: { ":userEmail": `${info.email}`, ":userInfo": "userInfo" },
        };
        const queryResults = await db_1.default.query(queryParams).promise();
        if (queryResults.Items !== undefined && queryResults.Items.length > 0) {
            throw new models_1.CustomError(401, "User with that email already exists");
        }
        //Hash password to save to DB, delete password from info to be passed to DB and add passwordhash to object to be save to DB
        const passwordhash = bcryptjs_1.default.hashSync(info.password, 10);
        info.passwordhash = passwordhash;
        delete info.password;
        //create unique id for user
        info.id = uuid_1.v4();
        info.createdAt = Date.now().toString();
        //Create user Object in DynamoDB
        const putParams = {
            Item: {
                category: "userInfo",
                id: info.id,
                info: info,
            },
            ReturnConsumedCapacity: "TOTAL",
            TableName: "rsdrum",
        };
        const userInfo = await db_1.default.put(putParams).promise();
        //assign varraible for return info
        const newUser = info;
        //jwt sign id to create token
        const token = await jsonwebtoken_1.default.sign({ id: newUser.id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        //Deletes passwordhash to prevent sending back sensitive info
        delete newUser.passwordhash;
        res.status(200).json({ message: "User Created", token, user: newUser });
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
 * Login User
 ****************************/
usersRouter.post("/login", async (req, res) => {
    try {
        //user is of type User defined in the models
        const info = req.body.info;
        //Send email to get user info from users table in DB
        // const result = await pool.query("SELECT * FROM users WHERE email = $1", [info.email]); //Get query results
        const queryParams = {
            TableName: "rsdrum",
            KeyConditionExpression: "#category = :userInfo",
            FilterExpression: "#info.email = :userEmail",
            ExpressionAttributeNames: { "#info": "info", "#category": "category" },
            ExpressionAttributeValues: { ":userEmail": `${info.email}`, ":userInfo": "userInfo" },
        };
        const queryResults = await db_1.default.query(queryParams).promise();
        if (queryResults.Items === undefined || queryResults.Items.length === 0) {
            throw new models_1.CustomError(404, "No user found with that email.");
        }
        const user = queryResults.Items[0].info;
        //Returns a boolean predicated on the matching of the passwords
        const validPass = await bcryptjs_1.default.compare(info.password, user.passwordhash);
        //Throw error if the passwords don't match.
        if (!validPass) {
            throw new models_1.CustomError(400, "Request failed. Wrong password.");
        }
        //Create token for user id
        const token = await jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        //Delete sensitive information so as to not send it back.
        delete user.passwordhash;
        res.status(200).json({
            message: "Successfully Logged in!",
            user,
            token,
        });
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
 * GET USER
 ****************************/
usersRouter.get("/getUser", userValidation_1.default, // Validates user and gives us req.user property
async (req, res) => {
    try {
        //get user from validation session
        const user = req.user;
        //Delete all password hashes for return info
        delete user.passwordhash;
        //Responds with success message and the array of users
        res.status(200).json({ message: "Success", user });
    }
    catch (error) {
        console.log("Get User Error", error);
        if (error.status < 500) {
            res.status(error.status).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Internal server error", error });
        }
    }
});
/*****************************
 * GET USERS
 ****************************/
usersRouter.get("/getAllUsers", userValidation_1.default, async (req, res) => {
    try {
        //Get query specifications for getQueryArgs
        const info = req.query;
        //get user from validation session
        const user = req.user;
        //Throw error if user not admin
        if (!user.admin) {
            throw new models_1.CustomError(401, "Request failed. Requires admin privileges");
        }
        let queryResults;
        if (Object.entries(info).length > 0) {
            const infoProp = Object.keys(info)[0];
            const infoValue = utilities_1.typeConverter(Object.values(info)[0]);
            const queryParams = {
                TableName: "rsdrum",
                KeyConditionExpression: "#category = :userInfo",
                FilterExpression: "#info.#prop = :val",
                ExpressionAttributeNames: { "#category": "category", "#info": "info", "#prop": infoProp },
                ExpressionAttributeValues: { ":userInfo": "userInfo", ":val": infoValue },
            };
            queryResults = await db_1.default.query(queryParams).promise();
        }
        else {
            const queryParams = {
                TableName: "rsdrum",
                KeyConditionExpression: "#category = :userInfo",
                ExpressionAttributeNames: { "#category": "category" },
                ExpressionAttributeValues: { ":userInfo": "userInfo" },
                ConsistentRead: true,
            };
            queryResults = await db_1.default.query(queryParams).promise();
        }
        if (queryResults.Items === undefined) {
            res.status(200).json({ message: "No users found", users: [] });
        }
        //Delete all password hashes for return info
        const allUsers = queryResults.Items.map((item) => item.info);
        allUsers.forEach((user) => delete user.passwordhash);
        res.status(200).json({ message: "Success", users: allUsers });
    }
    catch (error) {
        console.log("Get all users error", error);
        if (error.status < 500) {
            res.status(error.status).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Internal server error", error });
        }
    }
});
/*****************************
 * UPDATE USER INFO
 ****************************/
usersRouter.put("/updateUser", userValidation_1.default, async (req, res) => {
    try {
        // User is of type User defined in the models
        const info = req.body.info;
        const user = req.user;
        const updateInfo = utilities_1.updateParamsFn(info);
        const updateParams = {
            TableName: "rsdrum",
            Key: {
                category: "userInfo",
                id: user.id,
            },
            UpdateExpression: updateInfo.setString,
            ExpressionAttributeValues: updateInfo.exAttVals,
            ReturnValues: "UPDATED_NEW",
        };
        const updatedUserInfo = await db_1.default.update(updateParams).promise();
        const updatedUser = updatedUserInfo.Attributes.info;
        res.status(200).json({ message: "User Updated", updatedUser });
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
 * UPDATE USER PASSWORD
 ****************************/
usersRouter.put("/updatePassword", userValidation_1.default, async (req, res) => {
    try {
        //Get info to update from req.body
        const updateInfo = req.body.info;
        //Get user from validation session
        const user = req.user;
        const getParams = {
            Key: {
                category: "userInfo",
                id: user.id,
            },
            TableName: "rsdrum",
        };
        const userData = await db_1.default.get(getParams).promise();
        const userInfo = userData.Item.info;
        //bcrypt.compare returns a boolean. False if the passwords don't match
        const validPass = await bcryptjs_1.default.compare(updateInfo.password, userInfo.passwordhash);
        //Throw error if the password is invalid.
        if (!validPass) {
            throw new models_1.CustomError(400, "Request failed. Wrong password.");
        }
        //Hash password before saving to db
        const passHash = bcryptjs_1.default.hashSync(updateInfo.newPassword, 10);
        const updateParams = {
            TableName: "rsdrum",
            Key: {
                category: "userInfo",
                id: user.id,
            },
            UpdateExpression: "set info.passwordhash = :passHash",
            ExpressionAttributeValues: { ":passHash": passHash },
            ReturnValues: "UPDATED_NEW",
        };
        const updatedUserInfo = await db_1.default.update(updateParams).promise();
        res.status(200).json({ message: "Password Updated" });
    }
    catch (error) {
        console.log("Update Password Error", error);
        if (error.status < 500) {
            res.status(error.status).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Internal server error", error });
        }
    }
});
/*****************************
 * DELETE USER
 ****************************/
usersRouter.delete("/deleteUser/:id", userValidation_1.default, async (req, res) => {
    try {
        //Id of user to delete
        const userId = req.params.id;
        //Get user set in validation session
        const user = req.user;
        //Throw an error if user is not deleting themselves and not an admin
        if (userId !== user.id && !user.admin) {
            throw new models_1.CustomError(401, "User not deleted. Need to be logged in as user or admin");
        }
        //Throw an error if user is site admin
        if (userId === user.id && user.admin) {
            throw new models_1.CustomError(401, "Admin cannot be deleted.");
        }
        //Delete User from users table
        const params = {
            Key: {
                category: "userInfo",
                id: userId,
            },
            TableName: "rsdrum",
        };
        await db_1.default.delete(params, () => { });
        //Get and update lesson to remove deleted user.
        const queryParams = {
            TableName: "rsdrum",
            KeyConditionExpression: "#category = :lessons",
            ExpressionAttributeNames: { "#category": "category" },
            ExpressionAttributeValues: { ":lessons": "lessons" },
            ConsistentRead: true,
        };
        let results = await db_1.default.query(queryParams).promise();
        let lessonsDbItems = results.Items;
        const filteredLessonItems = lessonsDbItems.filter((lessonItem) => lessonItem.info.students.some((x) => x.id === userId));
        const updatedLessonItems = filteredLessonItems.map((lesson) => {
            const updatedStudents = lesson.info.students.filter((student) => student.id !== userId);
            lesson.info.students = updatedStudents;
            console.log(lesson.info.students);
            const updatedComments = lesson.info.comments.filter((comment) => comment.userId !== userId);
            lesson.info.comments = updatedComments;
            return lesson;
        });
        for (let lessonItem of updatedLessonItems) {
            const updateParams = {
                TableName: "rsdrum",
                Key: {
                    category: "lessons",
                    id: lessonItem.id,
                },
                UpdateExpression: "SET info.comments = :comments, info.students = :students",
                ExpressionAttributeValues: {
                    ":comments": lessonItem.info.comments,
                    ":students": lessonItem.info.students,
                },
            };
            await db_1.default.update(updateParams).promise();
        }
        res.status(200).json({ message: "User Deleted" });
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
exports.default = usersRouter;
