"use strict";
// /**
// Lessons: ~/lessons
//     POST /createLesson          => Create lesson**
//     POST /createRelation/       => Create relation for user and lesson and assignments**
//     GET/studentLessons/:id      => Get lesson relationship with students*
//     GET/getLessons              => Get all lessons*
//     PUT/updateLessons/:id       => Update lesson**
//     PUT/lessonFinished/:id      => Mark lesson as finshed*
//     DELETE/deleteRelation       => Delete relation between user and lesson**
//     DELETE/deleteLesson         => Delete lesson**
//  */
// import * as dotenv from "dotenv";
// dotenv.config();
// import { Router, Request, Response } from "express";
// import pool from "../db";
// import validation from "../middleware/userValidation";
// import { User, Lesson, UsersLesson, RequestWithUser, CustomError } from "../models";
// import getQueryArgs from "../utilities/getQueryArgsFn";
// import autoAssign from "../utilities/autoAssign";
// const lessonsRouter = Router();
// /***************************
//  * CREATE LESSON
//  **************************/
// lessonsRouter.post("/createLesson", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     //Get lesson info
//     const info: Lesson = req.body.info;
//     //Get user info from validation session
//     const user: User = req.user!;
//     //Throw error if not an admin
//     if (!user.site_admin) {
//       throw new CustomError(401, "Request failed. Admin privileges required.");
//     }
//     //utility function to get query arguments.
//     const { queryString, valArray } = getQueryArgs("insert", "lessons", info);
//     //if querystring empty, throw error
//     if (!queryString) {
//       throw new CustomError(400, "Request failed. Lesson not created. DB Insertion problem.");
//     }
//     //creates lesson and returns lesson info into newLesson
//     const result = await pool.query(queryString, valArray);
//     //Throw error if nothing is returned from DB
//     if (result.rowCount === 0) {
//       throw new CustomError(400, "Request failed. Lesson not created. DB Insertion problem.");
//     }
//     //Assign variable for return data.
//     const newLesson: Lesson = result.rows[0];
//     res.status(200).json({ message: "Lesson Created!", newLesson });
//   } catch (error) {
//     if (error.status < 500) {
//       res.status(error.status).json({ message: error.message });
//     } else {
//       res.status(500).json({ message: "Internal server error", error });
//     }
//   }
// });
// /***************************
//  * CREATE RELATION BETWEEN STUDENT AND LESSON
//  **************************/
// lessonsRouter.post("/assignLesson", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     //Get admin info
//     const admin = req.user!;
//     //get users_lessons info
//     const info: UsersLesson = req.body.info;
//     //Throw error if not and admin
//     if (!admin.site_admin) {
//       throw new CustomError(401, "Request failed. Admin privileges required.");
//     }
//     //Utility function to get query arguments
//     const { queryString, valArray } = getQueryArgs("insert", "users_lessons", info);
//     //If blank string, throw error
//     if (!queryString) {
//       throw new CustomError(400, "Request failed. Lesson assignment not created. Query parameters problem.");
//     }
//     // create users_lessons row which unlocks lessons for users via this relation
//     const result = await pool.query(queryString, valArray);
//     //Throw error if nothing is returned from DB
//     if (result.rowCount === 0) {
//       throw new CustomError(400, "Request failed. Lesson relation not created. DB Insertion problem.");
//     }
//     //Utility function to auto assign assignments associated with lesson to student
//     const autoAssigned = await autoAssign(info.student_id, info.lesson_id, result.rows[0].id);
//     const studentLesson = result.rows[0];
//     //throw an error if something went wrong with auto assign.
//     if (!autoAssigned.success) {
//       throw new CustomError(autoAssigned.status, autoAssigned.message);
//     }
//     res.status(200).json({
//       message: "Success. Student assigned lesson.",
//       autoAssigned,
//       studentLesson,
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
// /***************************
//  * GET STUDENT ALL LESSONS
//  **************************/
// lessonsRouter.get("/allStudentsLessons", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     //Get query specifications for getQueryArgs
//     const info = req.query;
//     //Get user info
//     const user: User = req.user!;
//     //Throw error if not admin or users own data
//     if (!user.site_admin) {
//       throw new CustomError(401, "Request failed. Admin privileges required.");
//     }
//     //Get query string and valArray dynamically given any or no info object.
//     const { queryString, valArray } = getQueryArgs("select", "users_lessons", info);
//     //Get all studentLessons
//     const result = await pool.query(queryString, valArray);
//     //Assign variable for return data
//     const userLessons: UsersLesson[] = result.rows;
//     res.status(200).json({ message: "Success.", userLessons });
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
//  * GET STUDENT LESSONS
//  **************************/
// lessonsRouter.get("/studentLessons/:id", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     //Get query specifications for getQueryArgs
//     const student_id = req.params.id;
//     //Get user info
//     const user: User = req.user!;
//     //Throw error if not admin or users own data
//     if (+student_id !== +user.id! && !user.site_admin) {
//       throw new CustomError(401, "Request failed. Admin privileges or data ownership required.");
//     }
//     //Get student lessons
//     const result = await pool.query("SELECT * FROM users_lessons WHERE student_id = $1", [student_id]);
//     //Assign variable for return data
//     const userLessons: UsersLesson[] = result.rows;
//     res.status(200).json({ message: "Success.", userLessons });
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
//  * GET ALL LESSONS
//  **************************/
// lessonsRouter.get("/getLessons", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     //Get query specifications for getQueryArgs
//     const info = req.query;
//     const user: User = req.user!;
//     //Get query string and valArray dynamically given any or no info object.
//     const { queryString, valArray } = getQueryArgs("select", "lessons", info);
//     //Get all lessons
//     const result = await pool.query(queryString, valArray);
//     //Assign variable for return data
//     const lessons: Lesson[] = result.rows;
//     res.status(200).json({ message: "Success.", lessons });
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
//  * UPDATE LESSON
//  **************************/
// lessonsRouter.put("/updateLesson", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     //get lesson info
//     const updateInfo: Lesson = req.body.info;
//     //get user info from validation session
//     const user: User = req.user!;
//     //get id to pass as the WHERE parameter in getQueryArg();
//     const id = updateInfo.id!;
//     //Throw error if user is not an admin
//     if (!user.site_admin) {
//       throw new CustomError(401, "Request failed. Admin privileges required.");
//     }
//     //Utility function to get the query params
//     const { queryString, valArray } = getQueryArgs("update", "lessons", updateInfo, +id); //Utility function to generate query string and values array to be used in pool.query.
//     //if string is empty, throw error
//     if (!queryString) {
//       throw new CustomError(400, "Request failed. Lesson assignment not created. Query parameters problem.");
//     }
//     //Send update query to DB
//     const result = await pool.query(queryString, valArray);
//     //Throw error if nothing is returned
//     if (result.rowCount == 0) {
//       throw new CustomError(404, "Request failed. Update query problem.");
//     }
//     //Variable for return data
//     const updatedLesson: Lesson = result.rows[0];
//     res.status(200).json({ message: "Successfully updated lesson", updatedLesson });
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
//  * UPDATE STUDENT LESSON
//  **************************/
// lessonsRouter.put("/updateStudentLesson", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     //Destructure info to get relevant info for query
//     const { completed, id }: UsersLesson = req.body.info;
//     //Update query to database
//     const result = await pool.query("UPDATE users_lessons SET completed = $1 WHERE id = $2 RETURNING *", [
//       completed,
//       id,
//     ]);
//     //Throw error if there is no return data
//     if (result.rowCount == 0) {
//       throw new CustomError(404, "Request failed. Update query problem.");
//     }
//     //Set variable for return data
//     const updatedStudentLesson = result.rows[0];
//     res.status(200).json({ message: "Success", updatedStudentLesson });
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
//  * DELETE LESSON
//  **************************/
// lessonsRouter.delete("/deleteLesson/:id", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     //get id of lesson
//     const id = req.params.id;
//     //get user id
//     const user = req.user!;
//     //Throw error if not admin
//     if (!user.site_admin) {
//       throw new CustomError(401, "Request failed. Admin privileges required.");
//     }
//     //Send DELETE query to lesson table in DB
//     const result = await pool.query("DELETE FROM lessons WHERE id = $1", [id]);
//     //Throw error if there is no return data
//     if (result.rowCount == 0) {
//       throw new CustomError(404, "Request failed. Update query problem.");
//     }
//     res.status(200).json({ message: "Lesson deleted." });
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
//  * DELETE STUDENT LESSON
//  **************************/
// lessonsRouter.delete("/deleteStudentLesson", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     //Get lesson id from params
//     const info = req.query;
//     //Get user info from validation session
//     const user = req.user!;
//     //Throw error if not admin
//     if (!user.site_admin) {
//       throw new CustomError(401, "Request failed. Admin privileges required.");
//     }
//     //Utility function to get the query params
//     const { queryString, valArray } = getQueryArgs("delete", "users_lessons", info);
//     //if string is empty, throw error
//     if (!queryString) {
//       throw new CustomError(
//         400,
//         "Request failed. Student assignment was not deleted. Query parameters problem."
//       );
//     }
//     //Send delete query to DB
//     const result = await pool.query(queryString, valArray);
//     //Throw error if there is no return data
//     if (result.rowCount == 0) {
//       throw new CustomError(404, "Request failed. Delete query problem.");
//     }
//     res.status(200).json({ message: "Lesson assingment deleted." });
//   } catch (error) {
//     console.log(error);
//     if (error.status < 500) {
//       res.status(error.status).json({ message: error.message });
//     } else {
//       res.status(500).json({ message: "Internal server error", error });
//     }
//   }
// });
// export default lessonsRouter;
