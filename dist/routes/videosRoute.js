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
const db_1 = __importDefault(require("../db"));
const userValidation_1 = __importDefault(require("../middleware/userValidation"));
const models_1 = require("../models");
const uuid_1 = require("uuid");
const utilities_1 = require("../utilities");
const videosRouter = express_1.Router();
/***************************
 * CREATE VIDEOS
 **************************/
videosRouter.post("/addVideo", userValidation_1.default, async (req, res) => {
    try {
        //Get video info
        const info = req.body.info;
        //Get user info
        const user = req.user;
        //Throw error if not an admin
        if (!user.admin) {
            throw new models_1.CustomError(401, "Request failed. Admin privileges required.");
        }
        //Utility function to make sure video urls are in embed format
        const formattedUrl = utilities_1.embedUrlMaker(info.videoUrl);
        if (!formattedUrl.success) {
            throw new models_1.CustomError(400, `${formattedUrl} is not a properly formated string. Be sure to either copy and paste from address bar or click "share" and the <> embed/`);
        }
        else {
            info.videoUrl = formattedUrl.newUrl;
        }
        // const queryParams: DocumentClient.QueryInput = {
        //   TableName: "rsdrum",
        //   KeyConditionExpression: "#category = :videos",
        //   FilterExpression: "#info.videoUrl = :url",
        //   ExpressionAttributeNames: { "#info": "info", "#category": "category" },
        //   ExpressionAttributeValues: { ":url": info.videoUrl, ":videos": "videos" },
        // };
        // const queryResults = await documentClient.query(queryParams).promise();
        // if (queryResults.Items !== undefined && queryResults.Items.length > 0) {
        //   throw new CustomError(401, "Video already exists.");
        // }
        //create unique id for user
        info.id = uuid_1.v4();
        //Create user Object in DynamoDB
        const putParams = {
            Item: {
                category: "videos",
                id: info.id,
                info: info,
            },
            ReturnConsumedCapacity: "TOTAL",
            TableName: "rsdrum",
        };
        await db_1.default.put(putParams).promise();
        res.status(200).json({ message: "Success. Video saved", newVideo: info });
    }
    catch (error) {
        console.log(error);
        if (error.status !== undefined && error.status < 500 && error.message !== undefined) {
            res.status(+error.status).json({ message: error.message });
        }
        else if (error.code === "23505") {
            res.status(409).json({ message: "Video already exists", error });
        }
        else {
            res.status(500).json({ message: "Internal server error", error });
        }
    }
});
/***************************
 * GET VIDEOS
 **************************/
videosRouter.get("/getVideos", async (req, res) => {
    try {
        const info = req.query;
        let results;
        if (Object.entries(info).length > 0) {
            const infoProp = Object.keys(info)[0];
            const infoValue = utilities_1.typeConverter(Object.values(info)[0]);
            const queryParams = {
                TableName: "rsdrum",
                KeyConditionExpression: "#category = :videos",
                FilterExpression: "#info.#prop = :val",
                ExpressionAttributeNames: { "#category": "category", "#info": "info", "#prop": infoProp },
                ExpressionAttributeValues: { ":videos": "videos", ":val": infoValue },
            };
            results = await db_1.default.query(queryParams).promise();
        }
        else {
            const queryParams = {
                TableName: "rsdrum",
                KeyConditionExpression: "#category = :videos",
                ExpressionAttributeNames: { "#category": "category" },
                ExpressionAttributeValues: { ":videos": "videos" },
            };
            results = await db_1.default.query(queryParams).promise();
        }
        const videos = results.Items.map((dbEntry) => dbEntry.info);
        res.status(200).json({ message: "Success.", videos });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
});
/***************************
 * GET VIDEOS BY TAG
 **************************/
videosRouter.get("/getVideosByTag", async (req, res) => {
    try {
        const info = req.query;
        const queryParams = {
            TableName: "rsdrum",
            KeyConditionExpression: "#category = :videos",
            ExpressionAttributeNames: { "#category": "category" },
            ExpressionAttributeValues: { ":videos": "videos" },
            ConsistentRead: true,
        };
        const queryResults = await db_1.default.query(queryParams).promise();
        const videos = queryResults
            .Items.map((dbItem) => dbItem.info)
            .filter((video) => video.tags.includes(info.tag));
        res.status(200).json({ message: "Success.", videos });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error", error });
    }
});
/***************************
 * UPDATE VIDEO
 **************************/
videosRouter.put("/updateVideo", userValidation_1.default, async (req, res) => {
    try {
        //get update info to pass in query
        const info = req.body.info;
        //get user information
        const user = req.user;
        //get id to locate where in database
        const id = req.body.id;
        //Throw error if not admin
        if (!user.admin) {
            throw new models_1.CustomError(401, "Request failed. Admin privileges required.");
        }
        const updateInfo = utilities_1.updateParamsFn(info);
        const updateParams = {
            TableName: "rsdrum",
            Key: {
                category: "videos",
                id: id,
            },
            UpdateExpression: updateInfo.setString,
            ExpressionAttributeValues: updateInfo.exAttVals,
            ReturnValues: "ALL_NEW",
        };
        const updatedVideoInfo = await db_1.default.update(updateParams).promise();
        const updatedVideo = updatedVideoInfo.Attributes.info;
        res.status(200).json({ message: "Successfully updated video", updatedVideo });
    }
    catch (error) {
        console.log(error);
        if (error.status !== undefined && error.status < 500 && error.message !== undefined) {
            res.status(error.status).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Internal server error", error });
        }
    }
});
/***************************
 * DELETE VIDEO
 **************************/
videosRouter.delete("/deleteVideo/:id", userValidation_1.default, async (req, res) => {
    try {
        //Video id passed as a param.
        const id = req.params.id;
        const user = req.user;
        //Checks for admin privileges. Throws error if not admin.
        if (!user.admin) {
            throw new models_1.CustomError(401, "Request failed. Admin privileges required.");
        }
        const params = {
            Key: {
                category: "videos",
                id: id,
            },
            TableName: "rsdrum",
        };
        await db_1.default.delete(params, () => { });
        res.status(200).json({ message: "Video deleted." });
    }
    catch (error) {
        console.log(error);
        if (error.status !== undefined && error.status < 500 && error.message !== undefined) {
            res.status(error.status).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Internal server error", error });
        }
    }
});
exports.default = videosRouter;
