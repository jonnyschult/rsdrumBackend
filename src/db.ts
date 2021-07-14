import { DynamoDB } from "aws-sdk";
import * as dotenv from "dotenv";
dotenv.config();

const documentClient = new DynamoDB.DocumentClient({
  region: "us-east-2",
  endpoint: process.env.DB_ENDPOINT,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY,
});

export default documentClient;
