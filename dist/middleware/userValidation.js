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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db"));
const models_1 = require("../models");
const validation = async (req, res, next) => {
    try {
        if (req.method == "OPTIONS") {
            next();
        }
        else {
            if (!req.headers.authorization) {
                //Checks to ensure that there is an authorization token.
                return res.status(403).json({ message: "Must provide a token.", authorized: false });
            }
            else {
                const token = req.headers.authorization;
                await jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
                    if (err) {
                        res.status(401).json({ message: "Problem with token", err });
                    }
                    if (decoded) {
                        const getParams = {
                            Key: {
                                id: decoded.id,
                                category: "userInfo",
                            },
                            TableName: "rsdrum",
                        };
                        const userData = await db_1.default.get(getParams).promise();
                        if (userData.Item === undefined) {
                            throw new models_1.CustomError(401, "No user found with that token. Please log in again.");
                        }
                        const user = userData.Item.info;
                        req.user = user;
                        next();
                    }
                });
            }
        }
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
};
exports.default = validation;
