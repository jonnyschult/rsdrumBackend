"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db"));
const models_1 = require("../models");
const updateInfoFn_1 = __importDefault(require("./updateInfoFn"));
const autoSignUp = async (student_id, lesson_id) => {
    try {
        const assignmentQuery = await db_1.default.query("SELECT * FROM assignments WHERE lesson_id = $1", [lesson_id]);
        if (assignmentQuery.rowCount === 0) {
            throw new models_1.CustomError(204, "No assignments associated with lesson.");
        }
        const assignments = assignmentQuery.rows;
        let student_assignments = await assignments.map(async (assignment) => {
            //Create an info object to pass to getQueryArgs
            const info = { student_id, assignment_id: +assignment.id, completed: false };
            //Utility function to get query arguments
            const { queryString, valArray } = updateInfoFn_1.default("insert", "users_assignments", info);
            //If blank string, throw error
            if (!queryString) {
                throw new models_1.CustomError(400, "Auto assign assignments query error");
            }
            // create users_assignments row which unlocks assignment for users via this relation
            const result = await db_1.default.query(queryString, valArray);
            //Throw error if nothing returns
            if (result.rowCount === 0) {
                throw new models_1.CustomError(400, "Request failed. Assignment relation not created. DB Insertion problem.");
            }
            return result.rows[0];
        });
        return { status: 200, success: true, student_assignments, message: "" };
    }
    catch (err) {
        return { status: err.status, success: false, student_assignments: [], message: err.message };
    }
};
