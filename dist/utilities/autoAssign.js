"use strict";
// import pool from "../db";
// import { CustomError, Assignment, UsersAssignment } from "../models";
// import getQueryArgs from "./getQueryArgsFn";
// //Interface to describe the return of the autoAssign function
// interface AutoSignReturn {
//   message: string;
//   success: boolean;
//   student_assignments: any[];
//   status: number;
// }
// //A function which automatically assigns assignments associated with a lesson to the user who is assigned the lesson
// const autoAssign: (
//   student_id: number,
//   lesson_id: number,
//   users_lessons_id: number
// ) => Promise<AutoSignReturn> = async (student_id: number, lesson_id: number, users_lessons_id: number) => {
//   try {
//     //Get all assignments associated with a lesson.
//     const assignmentQuery = await pool.query("SELECT * FROM assignments WHERE lesson_id = $1", [lesson_id]);
//     //If there are none, give a 204
//     if (assignmentQuery.rowCount === 0) {
//       return {
//         status: 204,
//         success: true,
//         student_assignments: [],
//         message: "No assignments associated with lesson.",
//       };
//     }
//     //Give variable to assignments returned from query
//     const assignments = assignmentQuery.rows;
//     //This variable holds an array of query elements. It'l put inside Promise.all because the array is initially just promises
//     let student_assignments: UsersAssignment[] = await Promise.all(
//       //map over the assignments returned above and associate them with the user passed as an argument to this function.
//       assignments.map(async (assignment: Assignment) => {
//         //Create an info object to pass to getQueryArgs
//         const info: UsersAssignment = {
//           users_lessons_id,
//           student_id,
//           assignment_id: +assignment.id!,
//           completed: false,
//         };
//         //Utility function to get query arguments
//         const { queryString, valArray } = getQueryArgs("insert", "users_assignments", info);
//         //If blank string, throw error
//         if (!queryString) {
//           throw new CustomError(400, "Auto assign assignments query error");
//         }
//         // create users_assignments row which unlocks assignment for users via this relation
//         const result = await pool.query(queryString, valArray);
//         //Throw error if nothing returns
//         if (result.rowCount === 0) {
//           throw new CustomError(
//             400,
//             "Request failed. Assignment relation not created. DB Insertion problem."
//           );
//         }
//         return result.rows[0];
//       })
//     );
//     //return object with information.
//     return {
//       status: 200,
//       success: true,
//       student_assignments,
//       message: `All assignments in lesson ${lesson_id} have been assigned.`,
//     };
//   } catch (err) {
//     return {
//       status: err.status,
//       success: false,
//       student_assignments: [],
//       message: err.message + " from Auto Assign",
//     };
//   }
// };
// export default autoAssign;
