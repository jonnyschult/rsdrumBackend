import * as dotenv from "dotenv";
dotenv.config();
import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidV4 } from "uuid";
import documentClient from "../db";
import validation from "../middleware/userValidation";
import { User, RequestWithUser, CustomError, Lesson, Comment } from "../models";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { updateParamsFn, typeConverter } from "../utilities";
// import getQueryArgs from "../utilities/getQueryArgsFn";

const usersRouter = Router();

/**********************
 * REGISTER USER
 *********************/

usersRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const info: User = req.body.info;

    if (info.password!.length < 8) {
      throw new CustomError(406, "Password less than 8 characters long");
    }

    const queryParams: DocumentClient.QueryInput = {
      TableName: "rsdrum",
      KeyConditionExpression: "#category = :userInfo",
      FilterExpression: "#info.email = :userEmail",
      ExpressionAttributeNames: { "#info": "info", "#category": "category" },
      ExpressionAttributeValues: { ":userEmail": `${info.email}`, ":userInfo": "userInfo" },
    };

    const queryResults = await documentClient.query(queryParams).promise();

    if (queryResults.Items !== undefined && queryResults.Items.length > 0) {
      throw new CustomError(401, "User with that email already exists");
    }

    //Hash password to save to DB, delete password from info to be passed to DB and add passwordhash to object to be save to DB
    const passwordhash: string = bcrypt.hashSync(info.password!, 10);
    info.passwordhash = passwordhash;
    delete info.password;

    //create unique id for user
    info.id = uuidV4();

    info.createdAt = Date.now().toString();

    //Create user Object in DynamoDB
    const putParams: DocumentClient.PutItemInput = {
      Item: {
        category: "userInfo",
        id: info.id,
        info: info,
      },
      ReturnConsumedCapacity: "TOTAL",
      TableName: "rsdrum",
    };

    const userInfo = await documentClient.put(putParams).promise();

    //assign varraible for return info
    const newUser = info;

    //jwt sign id to create token
    const token: string = await jwt.sign({ id: newUser.id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    //Deletes passwordhash to prevent sending back sensitive info
    delete newUser.passwordhash;

    res.status(200).json({ message: "User Created", token, user: newUser });
  } catch (error) {
    console.log("In register endpoint", error);
    if (error.status < 500) {
      res.status(error.status).json({ message: error.message });
    } else if (error.constraint === "users_email_key") {
      //bit hacky, but sends unique error back which is easier to catch on the front end.
      res.status(409).json({ message: "User already exists", error });
    } else {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
});

/*****************************
 * Login User
 ****************************/
usersRouter.post("/login", async (req: Request, res: Response) => {
  try {
    //user is of type User defined in the models
    const info: User = req.body.info;

    //Send email to get user info from users table in DB
    // const result = await pool.query("SELECT * FROM users WHERE email = $1", [info.email]); //Get query results

    const queryParams: DocumentClient.QueryInput = {
      TableName: "rsdrum",
      KeyConditionExpression: "#category = :userInfo",
      FilterExpression: "#info.email = :userEmail",
      ExpressionAttributeNames: { "#info": "info", "#category": "category" },
      ExpressionAttributeValues: { ":userEmail": `${info.email}`, ":userInfo": "userInfo" },
    };

    const queryResults = await documentClient.query(queryParams).promise();

    if (queryResults.Items === undefined || queryResults.Items.length === 0) {
      throw new CustomError(404, "No user found with that email.");
    }

    const user = queryResults.Items[0].info as User;

    //Returns a boolean predicated on the matching of the passwords
    const validPass = await bcrypt.compare(info.password!, user.passwordhash!);

    //Throw error if the passwords don't match.
    if (!validPass) {
      throw new CustomError(400, "Request failed. Wrong password.");
    }

    //Create token for user id
    const token: string = await jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    //Delete sensitive information so as to not send it back.
    delete user.passwordhash;

    res.status(200).json({
      message: "Successfully Logged in!",
      user,
      token,
    });
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
 * GET USER
 ****************************/
usersRouter.get(
  "/getUser",
  validation, // Validates user and gives us req.user property
  async (req: RequestWithUser, res: Response) => {
    try {
      //get user from validation session
      const user = req.user!;

      //Delete all password hashes for return info
      delete user.passwordhash;

      //Responds with success message and the array of users
      res.status(200).json({ message: "Success", user });
    } catch (error) {
      console.log("Get User Error", error);
      if (error.status < 500) {
        res.status(error.status).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error", error });
      }
    }
  }
);

/*****************************
 * GET USERS
 ****************************/
usersRouter.get("/getAllUsers", validation, async (req: RequestWithUser, res: Response) => {
  try {
    //Get query specifications for getQueryArgs
    const info = req.query;
    //get user from validation session
    const user = req.user!;

    //Throw error if user not admin
    if (!user.admin) {
      throw new CustomError(401, "Request failed. Requires admin privileges");
    }

    let queryResults;
    if (Object.entries(info).length > 0) {
      const infoProp = Object.keys(info)[0];
      const infoValue = typeConverter(Object.values(info)[0] as string);

      const queryParams: DocumentClient.QueryInput = {
        TableName: "rsdrum",
        KeyConditionExpression: "#category = :userInfo",
        FilterExpression: "#info.#prop = :val",
        ExpressionAttributeNames: { "#category": "category", "#info": "info", "#prop": infoProp },
        ExpressionAttributeValues: { ":userInfo": "userInfo", ":val": infoValue },
      };

      queryResults = await documentClient.query(queryParams).promise();
    } else {
      const queryParams: DocumentClient.QueryInput = {
        TableName: "rsdrum",
        KeyConditionExpression: "#category = :userInfo",
        ExpressionAttributeNames: { "#category": "category" },
        ExpressionAttributeValues: { ":userInfo": "userInfo" },
        ConsistentRead: true,
      };

      queryResults = await documentClient.query(queryParams).promise();
    }

    if (queryResults.Items === undefined) {
      res.status(200).json({ message: "No users found", users: [] });
    }

    //Delete all password hashes for return info
    const allUsers = queryResults.Items!.map((item) => item.info);
    allUsers.forEach((user: any) => delete user.passwordhash);

    res.status(200).json({ message: "Success", users: allUsers });
  } catch (error) {
    console.log("Get all users error", error);
    if (error.status < 500) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
});

/*****************************
 * UPDATE USER INFO
 ****************************/
usersRouter.put("/updateUser", validation, async (req: RequestWithUser, res: Response) => {
  try {
    // User is of type User defined in the models
    const info: User = req.body.info;
    const user: User = req.user!;

    const updateInfo = updateParamsFn(info);

    const updateParams: DocumentClient.UpdateItemInput = {
      TableName: "rsdrum",
      Key: {
        category: "userInfo",
        id: user.id,
      },

      UpdateExpression: updateInfo.setString,
      ExpressionAttributeValues: updateInfo.exAttVals,
      ReturnValues: "UPDATED_NEW",
    };

    const updatedUserInfo = await documentClient.update(updateParams).promise();
    const updatedUser = updatedUserInfo.Attributes!.info;

    res.status(200).json({ message: "User Updated", updatedUser });
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
});

/*****************************
 * UPDATE USER PASSWORD
 ****************************/
usersRouter.put("/updatePassword", validation, async (req: RequestWithUser, res: Response) => {
  try {
    //Get info to update from req.body
    const updateInfo: { password: string; newPassword: string } = req.body.info;
    //Get user from validation session
    const user = req.user!;

    const getParams = {
      Key: {
        category: "userInfo",
        id: user.id,
      },
      TableName: "rsdrum",
    };

    const userData = await documentClient.get(getParams).promise();

    const userInfo = userData.Item!.info as User;

    //bcrypt.compare returns a boolean. False if the passwords don't match
    const validPass = await bcrypt.compare(updateInfo.password, userInfo.passwordhash!);

    //Throw error if the password is invalid.
    if (!validPass) {
      throw new CustomError(400, "Request failed. Wrong password.");
    }

    //Hash password before saving to db
    const passHash: string = bcrypt.hashSync(updateInfo.newPassword, 10);

    const updateParams: DocumentClient.UpdateItemInput = {
      TableName: "rsdrum",
      Key: {
        category: "userInfo",
        id: user.id,
      },
      UpdateExpression: "set info.passwordhash = :passHash",
      ExpressionAttributeValues: { ":passHash": passHash },
      ReturnValues: "UPDATED_NEW",
    };

    const updatedUserInfo = await documentClient.update(updateParams).promise();

    res.status(200).json({ message: "Password Updated" });
  } catch (error) {
    console.log("Update Password Error", error);
    if (error.status < 500) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
});

/*****************************
 * DELETE USER
 ****************************/
usersRouter.delete("/deleteUser/:id", validation, async (req: RequestWithUser, res: Response) => {
  try {
    //Id of user to delete
    const userId = req.params.id;
    //Get user set in validation session
    const user = req.user!;

    //Throw an error if user is not deleting themselves and not an admin
    if (userId !== user.id && !user.admin) {
      throw new CustomError(401, "User not deleted. Need to be logged in as user or admin");
    }

    //Throw an error if user is site admin
    if (userId === user.id && user.admin) {
      throw new CustomError(401, "Admin cannot be deleted.");
    }

    //Delete User from users table
    const params: DocumentClient.DeleteItemInput = {
      Key: {
        category: "userInfo",
        id: userId,
      },
      TableName: "rsdrum",
    };
    await documentClient.delete(params, () => {});

    //Get and update lesson to remove deleted user.
    const queryParams: DocumentClient.QueryInput = {
      TableName: "rsdrum",
      KeyConditionExpression: "#category = :lessons",
      ExpressionAttributeNames: { "#category": "category" },
      ExpressionAttributeValues: { ":lessons": "lessons" },
      ConsistentRead: true,
    };

    let results = await documentClient.query(queryParams).promise();
    let lessonsDbItems = results.Items!;

    const filteredLessonItems = lessonsDbItems.filter((lessonItem) =>
      lessonItem.info.students.some((x: User) => x.id === userId)
    );

    const updatedLessonItems = filteredLessonItems.map((lesson) => {
      const updatedStudents = lesson.info.students!.filter((student: User) => student.id !== userId);
      lesson.info.students = updatedStudents;
      console.log(lesson.info.students);
      const updatedComments = lesson.info.comments!.filter((comment: Comment) => comment.userId !== userId);
      lesson.info.comments = updatedComments;
      return lesson;
    });

    for (let lessonItem of updatedLessonItems) {
      const updateParams: DocumentClient.UpdateItemInput = {
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

      await documentClient.update(updateParams).promise();
    }

    res.status(200).json({ message: "User Deleted" });
  } catch (error) {
    console.log(error);
    if (error.status < 500) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
});

export default usersRouter;
