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
const mailgun_js_1 = __importDefault(require("mailgun-js"));
const nodemailerRouter = express_1.Router();
/***************************
 * SEND MAIL
 **************************/
nodemailerRouter.post("/sendMail", async (req, res) => {
    try {
        const info = req.body.info;
        const mg = mailgun_js_1.default({ apiKey: process.env.MAILGUN_KEY, domain: process.env.MAILGUN_DOMAIN });
        const data = {
            from: `${info.name} ${info.email}`,
            to: "rcschult@comcast.net",
            subject: info.subject,
            text: `${info.message}\n \n Reply to: ${info.email}`,
        };
        await mg.messages().send(data, (error, body) => {
            if (error) {
                throw error;
            }
            else {
                res.status(200).json({ message: "Message Sent", body });
            }
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error. Message not sent", error });
    }
});
exports.default = nodemailerRouter;
