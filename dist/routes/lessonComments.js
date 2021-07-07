"use strict";
// /*
// Comments: ~/comment
//     POST /createComment         => Create comment*
//     GET/comments                => Get comment*
//     PUT/updateComment/:id       => Mark comment as read or update contents*
//     DELETE/deleteComment        => Delete comment*
//  */
// import * as dotenv from "dotenv";
// dotenv.config();
// import { Router, Request, Response } from "express";
// import pool from "../db";
// import validation from "../middleware/userValidation";
// import { User, Lesson, UsersLesson, Comment, RequestWithUser, CustomError } from "../models";
// import getQueryArgs from "../utilities/getQueryArgsFn";
// const commentsRouter = Router();
// /***************************
//  * CREATE COMMENT
//  **************************/
// commentsRouter.post("/createComment", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     //Get comment info
//     const info: Comment = req.body.info;
//     //Get user info from validation session
//     const user: User = req.user!;
//     //utility function to get query arguments.
//     const { queryString, valArray } = getQueryArgs("insert", "comments", info);
//     //if querystring empty, throw error
//     if (!queryString) {
//       throw new CustomError(400, "Request failed. Comment not created. Query parameters wrong.");
//     }
//     //creates comment and returns comment
//     const result = await pool.query(queryString, valArray);
//     //Throw error if nothing is returned from DB
//     if (result.rowCount === 0) {
//       throw new CustomError(400, "Request failed. Comment not created. DB Insertion problem.");
//     }
//     //Assign variable for return data.
//     const newComment: Comment = result.rows[0];
//     res.status(200).json({ message: "Comment Created!", newComment });
//   } catch (error) {
//     if (error.status < 500) {
//       res.status(error.status).json({ message: error.message });
//     } else {
//       res.status(500).json({ message: "Internal server error", error });
//     }
//   }
// });
// /***************************
//  * GET ALL COMMENTS FOR LESSON
//  **************************/
// commentsRouter.get("/getComments", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     //Get query specifications for getQueryArgs
//     const info = req.query;
//     const user: User = req.user!;
//     //security check to ensure that only proper users can get their own info
//     if (user.id !== +info.user_id! && !user.site_admin) {
//       throw new CustomError(401, "Request failed. Admin privileges or data ownership required.");
//     }
//     //Get query string and valArray dynamically given any or no info object.
//     const { queryString, valArray } = getQueryArgs("select", "comments", info);
//     //Get all comments given the conditions in info, if any
//     const result = await pool.query(queryString, valArray);
//     //Assign variable for return data
//     const comments: Comment[] = result.rows;
//     res.status(200).json({ message: "Success.", comments });
//   } catch (error) {
//     console.log(error);
//     if (error.status < 500) {
//       res.status(error.status).json({ message: error.message });
//     } else {
//       res.status(500).json({ message: "Internal server error", error });
//     }
//   }
// });
// /***************************
//  * UPDATE COMMENT
//  **************************/
// commentsRouter.put("/updateComment", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     //get comment info
//     const info: Comment = req.body.info;
//     //get user info from validation session
//     const user: User = req.user!;
//     //get id to pass as the WHERE parameter in getQueryArg();
//     const id = info.id!;
//     //Utility function to get the query params
//     const { queryString, valArray } = getQueryArgs("update", "comments", info, +id);
//     //if string is empty, throw error
//     if (!queryString) {
//       throw new CustomError(400, "Request failed. Comment not updated. Query parameters problem.");
//     }
//     //Send update query to DB
//     const result = await pool.query(queryString, valArray);
//     //Throw error if nothing is returned
//     if (result.rowCount == 0) {
//       throw new CustomError(404, "Request failed. Update query problem.");
//     }
//     //Variable for return data
//     const updatedComment = result.rows[0];
//     res.status(200).json({ message: "Successfully updated comment", updatedComment });
//   } catch (error) {
//     console.log(error);
//     if (error.status < 500) {
//       res.status(error.status).json(error);
//     } else {
//       res.status(500).json({ message: "Internal server error", error });
//     }
//   }
// });
// /***************************
//  * DELETE COMMENT
//  **************************/
// commentsRouter.delete("/deleteComment/:id", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     //get id of lesson
//     const id = req.params.id;
//     //Send DELETE query to comments table in DB
//     const result = await pool.query("DELETE FROM comments WHERE id = $1", [id]);
//     //Throw error if there is no return data
//     if (result.rowCount == 0) {
//       throw new CustomError(404, "Request failed. Delete query problem.");
//     }
//     res.status(200).json({ message: "Comment deleted." });
//   } catch (error) {
//     console.log(error);
//     if (error.status < 500) {
//       res.status(error.status).json(error);
//     } else {
//       res.status(500).json({ message: "Internal server error", error });
//     }
//   }
// });
// export default commentsRouter;
