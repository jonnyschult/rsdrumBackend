"use strict";
/*
Message: ~/messages
POST/createMessage          => Create message*
GET /getAllMessages         => Get all messages for user*
GET /getMessage/:id         => Get all messages for user*
DELETE/removeMessage/:id    => Delete message*
 */
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
const updateInfoFn_1 = __importDefault(require("../utilities/updateInfoFn"));
const messagesRouter = express_1.Router();
/***************************
 * CREATE VIDEOS
 **************************/
messagesRouter.post("/createMessage", userValidation_1.default, async (req, res) => {
    try {
        //Get message info
        const info = req.body.info;
        //Get user info
        const user = req.user;
        //utility function to get query arguments
        const { queryString, valArray } = updateInfoFn_1.default("insert", "messages", info);
        //if querystring empty, throw error
        if (!queryString) {
            throw new models_1.CustomError(400, "Request failed. Query parameters wrong.");
        }
        //Create messages and returns info
        const result = await db_1.default.query(queryString, valArray);
        //Throw error if nothing returns
        if (result.rowCount === 0) {
            throw new models_1.CustomError(400, "Request failed. DB Insertion problem.");
        }
        const newMessage = result.rows[0];
        res.status(200).json({ message: "Success. Message saved.", newMessage });
    }
    catch (err) {
        if (err.status < 500) {
            res.status(err.status).json({ err });
        }
        else {
            res.status(500).json({ message: "Internal server error", err });
        }
    }
});
/***************************
 * GET ALL MESSAGES
 **************************/
messagesRouter.get("/getVideos", userValidation_1.default, async (req, res) => {
    try {
        //Get all videos
        const result = await db_1.default.query("SELECT * FROM videos");
        //Put them all in an array named videos
        const videos = result.rows;
        //If no content found, send a 204.
        if (result.rowCount == 0) {
            res.status(204).json({ message: "No content in videos", videos });
        }
        res.status(200).json({ message: "Success.", videos });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error", err });
    }
});
/***************************
 * GET VIDEOS
 **************************/
messagesRouter.get("/getVideos", userValidation_1.default, async (req, res) => {
    try {
        //Get all videos
        const result = await db_1.default.query("SELECT * FROM videos");
        //Put them all in an array named videos
        const videos = result.rows;
        //If no content found, send a 204.
        if (result.rowCount == 0) {
            res.status(204).json({ message: "No content in videos", videos });
        }
        res.status(200).json({ message: "Success.", videos });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error", err });
    }
});
/***************************
 * DELETE VIDEO
 **************************/
messagesRouter.delete("/deleteVideo/:id", userValidation_1.default, async (req, res) => {
    try {
        //Video id passed as a param.
        const id = req.params.id;
        const user = req.user;
        //Checks for admin privileges. Throws error if not admin.
        if (!user.site_admin) {
            throw new models_1.CustomError(401, "Request failed. Admin privileges required.");
        }
        //Deletes video from DB
        await db_1.default.query("DELETE FROM videos WHERE id = $1", [id]);
        res.status(200).json({ message: "Video deleted." });
    }
    catch (err) {
        console.log(err);
        if (err.status < 500) {
            res.status(err.status).json({ err });
        }
        else {
            res.status(500).json({ message: "Internal server error", err });
        }
    }
});
exports.default = messagesRouter;
