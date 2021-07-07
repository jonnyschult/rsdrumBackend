"use strict";
// /*
// Users: ~/users
// POST /register            => Registers new user account
// POST /login               => Logs in a user
// GET/getUser               => Get list of users*
// GET/getAllUsers           => Get list of users**
// PUT/updatePassword        => Updates password *
// PUT/updateUser            => Update User Info *
// DELETE/removeUser         => Delete user *
// */
// import * as dotenv from "dotenv";
// dotenv.config();
// import { Router, Request, Response } from "express";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";
// import pool from "../db";
// import validation from "../middleware/userValidation";
// import { User, RequestWithUser, CustomError } from "../models";
// import getQueryArgs from "../utilities/getQueryArgsFn";
// const usersRouter = Router();
// /**********************
//  * REGISTER USER
//  *********************/
// /*
//  public email: string,
//  public password?: string,
//  public date_of_birth?: string,
//  public active?: boolean,
//  public student?: boolean,
//  public site_admin?: boolean,
//  public first_name?: string,
//  public last_name?: string,
//  public created_at?: string,
//  public updated_at?: string,
//  public id?: number,
//  public passwordhash?: string*/\
//  aws dynamodb put-item \
//  --table-name users \
//  --item \
//      '{"id": {"S": "asdf-fdsa-blah-yoyo"}, "email": {"S": "test@test.com"}, "passwordhash": {"S": "testpass"}, "date_of_birth": {"S": "09/12/1989"}, "active": {"BOOL": true}, "student": {"BOOL": true}, "site_admin": {"BOOL": true}, "first_name": {"S": "Jonny"}, "last_name": {"S": "Schult"}}' \
//  --return-consumed-capacity TOTAL \
// --endpoint-url http://localhost:8000
// usersRouter.post("/register", async (req: Request, res: Response) => {
//   try {
//     //User is of type User defined in the models
//     const info: User = req.body.info;
//     if (info.password!.length < 8) {
//       throw new CustomError(406, "Password less than 8 characters long");
//     }
//     //Hash password to save to DB, delete password from info to be passed to DB and add passwordhash to object to be save to DB
//     const passwordhash: string = bcrypt.hashSync(info.password, 10);
//     delete info.password;
//     info.passwordhash = passwordhash;
//     // utility function to generate query parameters
//     const { queryString, valArray } = getQueryArgs("insert", "users", info);
//     //Throw custom error if problem with query string.
//     if (!queryString) {
//       throw new CustomError(400, "Request failed. Lesson assignment not created. Query parameters problem.");
//     }
//     //Send INSERT to users table in DB
//     const result = await pool.query(queryString, valArray);
//     //Throw error if nothing returnd from DB
//     if (result.rowCount === 0) {
//       throw new CustomError(400, "Request failed. User not created. DB Insertion problem.");
//     }
//     //assign varraible for return data
//     const newUser = result.rows[0];
//     //jwt sign id to create token
//     const token: string = await jwt.sign({ id: newUser.id }, process.env.JWT_SECRET!, {
//       expiresIn: "1d",
//     });
//     //Deletes passwordhash to prevent sending back sensitive info
//     delete newUser.passwordhash;
//     res.status(200).json({ message: "User Created", token, user: newUser });
//   } catch (error) {
//     console.log(error);
//     if (error.status < 500) {
//       res.status(error.status).json({ message: error.message });
//     } else if (error.constraint === "users_email_key") {
//       //bit hacky, but sends unique error back which is easier to catch on the front end.
//       res.status(409).json({ message: "User already exists", error });
//     } else {
//       res.status(500).json({ message: "Internal server error", error });
//     }
//   }
// });
// /*****************************
//  * Login User
//  ****************************/
// usersRouter.post("/login", async (req: Request, res: Response) => {
//   try {
//     //user is of type User defined in the models
//     const info: User = req.body.info;
//     //Send email to get user info from users table in DB
//     const result = await pool.query("SELECT * FROM users WHERE email = $1", [info.email]); //Get query results
//     //Throw error if the result didn't yield anything
//     if (result.rowCount === 0) {
//       throw new CustomError(404, "Request failed. Couldn't find user");
//     }
//     //Set variable for return info
//     const queryUser: User = result.rows[0]; //Set queryUser as the result of the query to the users table.
//     //Returns a boolean predicated on the matching of the passwords
//     const validPass = await bcrypt.compare(info.password, queryUser.passwordhash!);
//     //Throw error if the passwords don't match.
//     if (!validPass) {
//       throw new CustomError(400, "Request failed. Wrong password.");
//     }
//     //Create token for user id
//     const token: string = await jwt.sign({ id: queryUser.id }, process.env.JWT_SECRET!, {
//       expiresIn: "1d",
//     });
//     //Delete sensitive information so as to not send it back.
//     delete queryUser.passwordhash;
//     res.status(200).json({
//       message: "Successfully Logged in!",
//       user: queryUser,
//       token,
//     });
//   } catch (error) {
//     console.log(error);
//     if (error.status < 500) {
//       res.status(error.status).json({ message: error.message });
//     } else {
//       res.status(500).json({ message: "Internal server error", error });
//     }
//   }
// });
// /*****************************
//  * GET USER
//  ****************************/
// usersRouter.get(
//   "/getUser",
//   validation, // Validates user and gives us req.user property
//   async (req: RequestWithUser, res: Response) => {
//     try {
//       //get user from validation session
//       const user = req.user!;
//       //Delete all password hashes for return data
//       delete user.passwordhash;
//       //Responds with success message and the array of users
//       res.status(200).json({ message: "Success", user });
//     } catch (error) {
//       console.log(error);
//       if (error.status < 500) {
//         res.status(error.status).json({ message: error.message });
//       } else {
//         res.status(500).json({ message: "Internal server error", error });
//       }
//     }
//   }
// );
// /*****************************
//  * GET USERS
//  ****************************/
// usersRouter.get(
//   "/getAllUsers",
//   validation, // Validates user and gives us req.user property
//   async (req: RequestWithUser, res: Response) => {
//     try {
//       //Get query specifications for getQueryArgs
//       const info = req.query;
//       //get user from validation session
//       const user = req.user!;
//       //Throw error if user not admin
//       if (!user.site_admin) {
//         throw new CustomError(401, "Request failed. Requires admin privileges");
//       }
//       //Get query string and valArray dynamically given any or no info object.
//       const { queryString, valArray } = getQueryArgs("select", "users", info);
//       //Get lessons
//       const result = await pool.query(queryString, valArray);
//       //Set variable for return data
//       const allUsers: User[] = result.rows;
//       //Delete all password hashes for return data
//       allUsers.forEach((user: any) => delete user.passwordhash);
//       //Responds with success message and the array of users
//       res.status(200).json({ message: "Success", users: allUsers });
//     } catch (error) {
//       console.log(error);
//       if (error.status < 500) {
//         res.status(error.status).json({ message: error.message });
//       } else {
//         res.status(500).json({ message: "Internal server error", error });
//       }
//     }
//   }
// );
// /*****************************
//  * UPDATE USER INFO
//  ****************************/
// usersRouter.put(
//   "/updateUser",
//   validation, // Validates user and gives us req.user property
//   async (req: RequestWithUser, res: Response) => {
//     try {
//       //Information to pass to UPDATE DB
//       const updateInfo: User = req.body.info;
//       //Get user info from validation
//       const user = req.user!;
//       //Utility function to get query arguments to pass to DB query
//       const { queryString, valArray } = getQueryArgs("update", "users", updateInfo, +user.id!); //Utility function to generate query string and values array to be used in pool.query.
//       //if string is empty, throw error
//       if (!queryString) {
//         throw Error;
//       }
//       //Pass UPDATE to users table in DB
//       const result = await pool.query(queryString, valArray);
//       //if nothing is returned, throw and error
//       if (result.rowCount === 0) {
//         throw new CustomError(404, "Request failed. No such user found.");
//       }
//       //Set variable for return data
//       const updatedUser: User = result.rows[0];
//       //Delete password hash off of return user info.
//       delete updatedUser.passwordhash;
//       res.status(200).json({ message: "User Updated", updatedUser });
//     } catch (error) {
//       console.log(error);
//       if (error.status < 500) {
//         res.status(error.status).json({ message: error.message });
//       } else {
//         res.status(500).json({ message: "Internal server error", error });
//       }
//     }
//   }
// );
// /*****************************
//  * UPDATE USER PASSWORD
//  ****************************/
// usersRouter.put(
//   "/updatePassword",
//   validation, // Validates user and gives us req.user property
//   async (req: RequestWithUser, res: Response) => {
//     try {
//       //Get info to update from req.body
//       const updateInfo: { password: string; newPassword: string } = req.body.info;
//       //Get user from validation session
//       const user = req.user!;
//       //Pass UPDATE query to users table in DB
//       const result = await pool.query("SELECT * FROM users WHERE id = $1", [user.id]);
//       //Throw error if nothing is returned
//       if (result.rowCount === 0) {
//         throw new CustomError(404, "Request failed. No such user found.");
//       }
//       //Set variable for return data
//       const queryUser: User = result.rows[0];
//       //bcrypt.compare returns a boolean. False if the passwords don't match
//       const validPass = await bcrypt.compare(updateInfo.password, queryUser.passwordhash!);
//       //Throw error if the password is invalid.
//       if (!validPass) {
//         throw new CustomError(400, "Request failed. Wrong password.");
//       }
//       //Hash password before saving to db
//       const passwordhash: string = bcrypt.hashSync(updateInfo.newPassword, 10);
//       //save hashed password
//       await pool.query("UPDATE users SET passwordhash = $1", [passwordhash]);
//       res.status(200).json({ message: "Password Updated" });
//     } catch (error) {
//       console.log(error);
//       if (error.status < 500) {
//         res.status(error.status).json({ message: error.message });
//       } else {
//         res.status(500).json({ message: "Internal server error", error });
//       }
//     }
//   }
// );
// /*****************************
//  * DELETE USER
//  ****************************/
// usersRouter.delete(
//   "/deleteUser/:id",
//   validation, // Validates user and gives us req.user property
//   async (req: RequestWithUser, res: Response) => {
//     try {
//       //Id of user to delete
//       const idToRemove = +req.params.id;
//       //Get user set in validation session
//       const user = req.user!;
//       //Throw an error if user is not deleting themselves and not an admin
//       if (idToRemove !== user.id && !user.site_admin) {
//         throw new CustomError(401, "User not deleted. Need to be logged in as user or admin");
//       }
//       //Throw an error if user is not deleting themselves and not an admin
//       if (idToRemove === user.id && user.site_admin) {
//         throw new CustomError(401, "Admin cannot be deleted.");
//       }
//       //Send DELETE query to users table in DB
//       await pool.query("DELETE FROM users WHERE id = $1", [idToRemove]);
//       res.status(200).json({ message: "User Deleted" });
//     } catch (error) {
//       console.log(error);
//       if (error.status < 500) {
//         res.status(error.status).json({ message: error.message });
//       } else {
//         res.status(500).json({ message: "Internal server error", error });
//       }
//     }
//   }
// );
// export default usersRouter;
