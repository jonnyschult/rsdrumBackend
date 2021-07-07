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

import * as dotenv from "dotenv";
dotenv.config();
import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 as uuidV4 } from "uuid";
import documentClient from "../db";
import validation from "../middleware/userValidation";
import { User, RequestWithUser, CustomError, Comment } from "../models";
import DynamoDB, { CreateTableInput, DocumentClient } from "aws-sdk/clients/dynamodb";
import { updateParamsFn, typeConverter } from "../utilities";

// import getQueryArgs from "../utilities/getQueryArgsFn";

const testRouter = Router();

/*****************************
 * CREATE
 ****************************/
testRouter.post("/test", async (req: Request, res: Response) => {});

/**********************
 * GET
 *********************/
testRouter.get("/test", validation, async (req: RequestWithUser, res: Response) => {});

/*****************************
 * UPDATE
 ****************************/
testRouter.put("/test", validation, async (req: RequestWithUser, res: Response) => {});

/*****************************
 * DELETE USER
 ****************************/
testRouter.delete("/test/:id", validation, async (req: RequestWithUser, res: Response) => {});

/*****************************
 * DELETE TABLE
 ****************************/
testRouter.delete("/deleteTable", async (req: RequestWithUser, res: Response) => {
  try {
    const dynamodb = new DynamoDB({
      region: "us-east-1",
      endpoint: "http://localhost:8000",
      secretAccessKey: process.env.SECRET_KEY,
      accessKeyId: process.env.ACCESS_KEY,
    });

    await dynamodb.deleteTable({ TableName: "rsdrum" }, () => {});
    res.status(200).json({ message: "Table Deleted" });
  } catch (error) {
    console.log(error);
    if (error.status < 500) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
});
/*****************************
 * CREATE TABLE
 ****************************/
/*aws dynamodb create-table \                                                  
    --table-name Music \ 
    --attribute-definitions \
        AttributeName=Artist,AttributeType=S \
        AttributeName=SongTitle,AttributeType=S \
    --key-schema \                    
        AttributeName=Artist,KeyType=HASH \
        AttributeName=SongTitle,KeyType=RANGE \
--provisioned-throughput \
        ReadCapacityUnits=10,WriteCapacityUnits=5 \
--endpoint-url http://localhost:8000
*/

testRouter.post("/createTable", async (req: RequestWithUser, res: Response) => {
  try {
    const dynamodb = new DynamoDB({
      region: "us-east-1",
      endpoint: "http://localhost:8000",
      secretAccessKey: process.env.SECRET_KEY,
      accessKeyId: process.env.ACCESS_KEY,
    });

    const createTableParams: CreateTableInput = {
      AttributeDefinitions: [
        { AttributeName: "category", AttributeType: "S" },
        { AttributeName: "id", AttributeType: "S" },
      ],
      KeySchema: [
        { AttributeName: "category", KeyType: "HASH" },
        { AttributeName: "id", KeyType: "RANGE" },
      ],
      TableName: "rsdrum",
      ProvisionedThroughput: { ReadCapacityUnits: 10, WriteCapacityUnits: 5 },
    };

    await dynamodb.createTable(createTableParams).promise();
    res.status(200).json({ message: "Table Created" });
  } catch (error) {
    console.log(error);
    if (error.status < 500) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
});

export default testRouter;
