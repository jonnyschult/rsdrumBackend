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
const nodemailer_1 = __importDefault(require("nodemailer"));
const nodemailerRouter = express_1.Router();
/***************************
 * CREATE PAYMENT INTENT
 **************************/
nodemailerRouter.post("/sendMail", async (req, res) => {
    try {
        const info = req.body.info;
        let transporter = nodemailer_1.default.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.SERVER_EMAIL,
                pass: process.env.SERVER_EMAIL_PASS,
            },
        });
        // send mail with defined transport object
        await transporter.sendMail({
            from: info.email,
            to: "rcschult@comcast.net",
            subject: info.subject,
            text: "Hello world",
            html: `
      <div>
          <p>
            FROM: <b>${info.name}</b> REPLY TO: <b>${info.email}</b>
          </p>
          <p>${info.message}</p>
        </div>
      `, // html body
        }, (error, success) => {
            if (error) {
                throw error;
            }
            else {
                res.status(200).json({ message: "Message Sent" });
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error. Message not sent", error });
    }
});
exports.default = nodemailerRouter;
