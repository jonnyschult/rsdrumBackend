import * as dotenv from "dotenv";
dotenv.config();
import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import documentClient from "../db";
import { User, RequestWithUser, CustomError } from "../models";

const validation = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    if (req.method == "OPTIONS") {
      next();
    } else {
      if (!req.headers.authorization) {
        //Checks to ensure that there is an authorization token.

        return res.status(403).json({ message: "Must provide a token.", authorized: false });
      } else {
        const token: string = req.headers.authorization;
        await jwt.verify(token, process.env.JWT_SECRET!, async (err, decoded) => {
          if (err) {
            res.status(401).json({ message: "Problem with token", err });
          }
          if (decoded) {
            const getParams = {
              Key: {
                id: (decoded as { id: string }).id,
                category: "userInfo",
              },
              TableName: "rsdrum",
            };

            const userData = await documentClient.get(getParams).promise();

            if (userData.Item === undefined) {
              throw new CustomError(401, "No user found with that token. Please log in again.");
            }

            const user = userData.Item!.info as User;

            req.user = user;
            next();
          }
        });
      }
    }
  } catch (error) {
    console.log(error);
    if (error.status < 500) {
      res.status(error.status).json({ message: error.message });
    } else if (error.constraint === "users_email_key") {
      //bit hacky, but sends unique error back which is easier to catch on the front end.
      res.status(409).json({ message: "User already exists", error });
    } else {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
};

export default validation;
