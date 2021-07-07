"use strict";
// import { Pool } from "pg";
// import * as dotenv from "dotenv";
// dotenv.config();
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });
// export default pool;
const aws_sdk_1 = require("aws-sdk");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
var dynamodb = new aws_sdk_1.DynamoDB({
    region: "us-east-1",
    endpoint: "http://localhost:8000",
    secretAccessKey: process.env.SECRET_KEY,
    accessKeyId: process.env.ACCESS_KEY,
});
exports.default = dynamodb;
