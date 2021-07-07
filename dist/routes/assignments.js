"use strict";
// /*
// Assignment: ~/assignments
// POST /createAssignment          => Create assignment**
// POST/ assignAssignment          => Assign assignment to user in users_assignments table**
// GET /getAssignements/:id        => Get all assignments for a specific module and users*
// GET /getStudentAssignments      => Get all assignments assigend to a student*
// PUT/updateAssignment/:id        => Update specific assignment**
// PUT/assignementFinished/:id     => Mark assignment as finished*
// DELETE/deleteAssignment/:id     => Delete assignment**
//  */
// import * as dotenv from "dotenv";
// dotenv.config();
// import { Router, Request, Response } from "express";
// import pool from "../db";
// import validation from "../middleware/userValidation";
// import { User, RequestWithUser, CustomError, Assignment, UsersAssignment } from "../models";
// import getQueryArgs from "../utilities/getQueryArgsFn";
// const assignmentsRouter = Router();
// /***************************
//  * CREATE ASSIGNMENT
//  **************************/
// assignmentsRouter.post("/createAssignment", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     //Get assignment info
//     const info: Assignment = req.body.info;
//     //Get user info
//     const user: User = req.user!;
//     //Throw error if not an admin
//     if (!user.site_admin) {
//       throw new CustomError(401, "Request failed. Admin privileges required.");
//     }
//     const { queryString, valArray } = getQueryArgs("insert", "assignments", info); //utility function to get query arguments
//     //if querystring empty, throw error
//     if (!queryString) {
//       throw new CustomError(400, "Request failed. Assignment not created. Query parameters wrong.");
//     }
//     //creates assignment and returns info
//     const result = await pool.query(queryString, valArray);
//     //Throw error if nothing returns
//     if (result.rowCount === 0) {
//       throw new CustomError(400, "Request failed. Assignment not created. DB Insertion problem.");
//     }
//     const newAssignment: Assignment = result.rows[0];
//     res.status(200).json({ message: "Assignment Created!", newAssignment });
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
//  * CREATE RELATION BETWEEN STUDENT AND ASSIGNMENTS
//  **************************/
// assignmentsRouter.post("/assignAssignment", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     //Get admin info
//     const admin = req.user!;
//     //get users_assignments info
//     const info: UsersAssignment = req.body.info;
//     //Throw error if not and admin
//     if (!admin.site_admin) {
//       throw new CustomError(401, "Request failed. Admin privileges required.");
//     }
//     //Utility function to get query arguments
//     const { queryString, valArray } = getQueryArgs("insert", "users_assignments", info);
//     //If blank string, throw error
//     if (!queryString) {
//       throw new CustomError(400, "Request failed. User not assigned assignment. DB Insertion problem.");
//     }
//     // create users_assignments row which unlocks assignment for users via this relation
//     const result = await pool.query(queryString, valArray);
//     //Throw error if nothing returns
//     if (result.rowCount === 0) {
//       throw new CustomError(400, "Request failed. Assignment relation not created. DB Insertion problem.");
//     }
//     res.status(200).json({ message: "Success. Student assigned assignment." });
//   } catch (error) {
//     if (error.status < 500) {
//       res.status(error.status).json({ message: error.message });
//     } else {
//       res.status(500).json({ message: "Internal server error", error });
//     }
//   }
// });
// /***************************
//  * GET ASSIGNMENTS
//  **************************/
// assignmentsRouter.get("/getAssignments", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     //Get info object from query params
//     const info = req.query;
//     //Get query string and valArray dynamically given any or no info object.
//     const { queryString, valArray } = getQueryArgs("select", "assignments", info);
//     //Get all assignments
//     const result = await pool.query(queryString, valArray);
//     //Put them all in an array named assignments
//     const assignments: Assignment[] = result.rows;
//     res.status(200).json({ message: "Success.", assignments });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Internal server error", error });
//   }
// });
// /***************************
//  * GET ASSIGNED ASSIGNMENTS
//  **************************/
// assignmentsRouter.get("/studentAssignments/:id", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     const student_id = req.params.id;
//     //get user from validation
//     const user = req.user!;
//     //Throw error if not admin or users own data
//     if (+student_id !== +user.id! && !user.site_admin) {
//       throw new CustomError(401, "Request failed. Admin privileges or data ownership required.");
//     }
//     //Get all the lessons for student from users_assignments table in DB
//     const result = await pool.query("SELECT * FROM users_assignments WHERE student_id = $1", [student_id]);
//     //Put them in array to return
//     const userAssignments: UsersAssignment[] = result.rows;
//     res.status(200).json({ message: "Success.", userAssignments });
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
//  * UPDATE ASSIGNMENT
//  **************************/
// assignmentsRouter.put("/updateAssignment", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     //get update info to pass in query
//     const updateInfo: Assignment = req.body.info;
//     //get user information
//     const user: User = req.user!;
//     //get id to locate where in database
//     const id = updateInfo.id!;
//     //Throw error if not admin
//     if (!user.site_admin) {
//       throw new CustomError(401, "Request failed. Admin privileges required.");
//     }
//     //Utility function to generate query string and values array to be used in pool.query.
//     const { queryString, valArray } = getQueryArgs("update", "assignments", updateInfo, +id);
//     //if string is empty, throw error
//     if (!queryString) {
//       throw new CustomError(400, "Request failed. Query parameters wrong.");
//     }
//     //Send update query to db.
//     const result = await pool.query(queryString, valArray);
//     //Send error if we get no return from DB
//     if (result.rowCount == 0) {
//       throw new CustomError(400, "Request failed. DB Insertion problem.");
//     }
//     //Return variable for data
//     const updatedAssignment = result.rows[0];
//     res.status(200).json({ message: "Successfully updated assignment", updatedAssignment });
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
//  * UPDATE STUDENT'S ASSIGNMENT
//  **************************/
// assignmentsRouter.put("/updateStudentAssignment", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     //Get destructed information to pass in query
//     const { completed, student_id }: UsersAssignment = req.body.info;
//     //get user from validation session
//     const user = req.user!;
//     //Check for access privileges
//     if (student_id !== +user.id! && !user.site_admin) {
//       throw new CustomError(401, "Request failed. Admin or user with access required to get assignments");
//     }
//     //Update users assignment
//     const result = await pool.query("UPDATE users_assignments SET completed = $1 WHERE id = $2 RETURNING *", [
//       completed,
//       student_id,
//     ]);
//     //Throw error if nothing is returned from DB
//     if (result.rowCount == 0) {
//       throw new CustomError(400, "Request failed. DB Insertion problem.");
//     }
//     //Return variable for data
//     const updatedStudentAssignment = result.rows[0];
//     res.status(200).json({ message: "Success", updatedStudentAssignment });
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
//  * DELETE ASSIGNMENT
//  **************************/
// assignmentsRouter.delete("/deleteAssignment/:id", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     //Assignment id passed as a param.
//     const id = req.params.id;
//     const user = req.user!;
//     //Checks for admin privileges. Throws error if not admin.
//     if (!user.site_admin) {
//       throw new CustomError(401, "Request failed. Admin privileges required.");
//     }
//     //Deletes assignment from DB
//     const result = await pool.query("DELETE FROM assignments WHERE id = $1", [id]);
//     res.status(200).json({ message: "Assingment deleted." });
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
//  * DELETE STUDENT ASSIGNMENT
//  **************************/
// assignmentsRouter.delete(
//   "/deleteStudentAssignment/:id",
//   validation,
//   async (req: RequestWithUser, res: Response) => {
//     try {
//       //Get user's assignment from params
//       const id = req.params.id;
//       const user = req.user!;
//       //Checks privileges. Throws error if not admin
//       if (!user.site_admin) {
//         throw new CustomError(401, "Request failed. Admin privileges required.");
//       }
//       //Deletes assignment from users_assignment table in DB
//       await pool.query("DELETE FROM users_assignments WHERE id = $1", [id]);
//       res.status(200).json({ message: "Student's assignment deleted." });
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
// export default assignmentsRouter;
