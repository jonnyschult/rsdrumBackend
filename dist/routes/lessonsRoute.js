"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const userValidation_1 = __importDefault(require("../middleware/userValidation"));
const uuid_1 = require("uuid");
const models_1 = require("../models");
const utilities_1 = require("../utilities");
const lessonsRouter = express_1.Router();
/***************************
 * CREATE LESSON
 **************************/
lessonsRouter.post("/createLesson", userValidation_1.default, async (req, res) => {
    try {
        //Get lesson info
        const info = req.body.info;
        //Get user info from validation session
        const user = req.user;
        //Throw error if not an admin
        if (!user.admin) {
            throw new models_1.CustomError(401, "Request failed. Admin privileges required.");
        }
        //create unique id for lesson and add other attributes.
        info.id = uuid_1.v4();
        //Create user Object in DynamoDB
        const putParams = {
            Item: {
                category: "lessons",
                id: info.id,
                info: info,
            },
            ReturnConsumedCapacity: "TOTAL",
            TableName: "rsdrum",
        };
        await db_1.default.put(putParams).promise();
        res.status(200).json({ message: "Lesson Created!", newLesson: info });
    }
    catch (error) {
        if (error.status < 500) {
            res.status(error.status).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Internal server error", error });
        }
    }
});
/***************************
 * ADD ASSIGNMENT
 **************************/
lessonsRouter.put("/addAssignment", userValidation_1.default, async (req, res) => {
    try {
        //Get admin info
        const admin = req.user;
        //get users_lessons info
        const info = req.body.info;
        const lessonId = req.body.id;
        //Throw error if not and admin
        if (!admin.admin) {
            throw new models_1.CustomError(401, "Request failed. Admin privileges required.");
        }
        info.id = uuid_1.v4();
        const getParams = {
            Key: {
                category: "lessons",
                id: lessonId,
            },
            TableName: "rsdrum",
        };
        const lessonData = await db_1.default.get(getParams).promise();
        const lesson = lessonData.Item.info;
        const updatedAssignmentsArr = lesson.assignments.length > 0 ? [...lesson.assignments, info] : [info];
        const updateParams = {
            TableName: "rsdrum",
            Key: {
                category: "lessons",
                id: lessonId,
            },
            UpdateExpression: "set info.assignments = :assignments",
            ExpressionAttributeValues: { ":assignments": updatedAssignmentsArr },
            ReturnValues: "UPDATED_NEW",
        };
        const updatedLessonData = await db_1.default.update(updateParams).promise();
        const updatedAssignments = updatedLessonData.Attributes.info.assignments;
        res.status(200).json({
            message: "Success. Assignment added to lesson.",
            updatedAssignments,
        });
    }
    catch (error) {
        console.log(error);
        if (error.status < 500) {
            res.status(error.status).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Internal server error", error });
        }
    }
});
/***************************
 * ADD STUDENT
 **************************/
lessonsRouter.put("/addStudent", userValidation_1.default, async (req, res) => {
    try {
        //Get admin info
        const admin = req.user;
        //get users_lessons info
        const info = req.body.info;
        const lessonId = req.body.id;
        //Throw error if not and admin
        if (!admin.admin) {
            throw new models_1.CustomError(401, "Request failed. Admin privileges required.");
        }
        const getParams = {
            Key: {
                category: "lessons",
                id: lessonId,
            },
            TableName: "rsdrum",
        };
        const lessonData = await db_1.default.get(getParams).promise();
        const lesson = lessonData.Item.info;
        const updatedStudentsArr = lesson.students.length > 0 ? [...lesson.students, info] : [info];
        const updateParams = {
            TableName: "rsdrum",
            Key: {
                category: "lessons",
                id: lessonId,
            },
            UpdateExpression: "set info.students = :students",
            ExpressionAttributeValues: { ":students": updatedStudentsArr },
            ReturnValues: "UPDATED_NEW",
        };
        const updatedLessonData = await db_1.default.update(updateParams).promise();
        const updatedStudents = updatedLessonData.Attributes.info.students;
        res.status(200).json({
            message: "Success. Student assigned lesson.",
            updatedStudents,
        });
    }
    catch (error) {
        console.log("Add Student Error", error);
        if (error.status < 500) {
            res.status(error.status).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Internal server error", error });
        }
    }
});
/***************************
 * ADD COMMENT
 **************************/
lessonsRouter.put("/addComment", userValidation_1.default, async (req, res) => {
    try {
        //Get admin info
        const user = req.user;
        //get users_lessons info
        const info = req.body.info;
        const lessonId = req.body.id;
        //Throw error if not and admin
        if (!user.admin && info.userId !== user.id) {
            throw new models_1.CustomError(401, "Request failed. Admin privileges required.");
        }
        info.id = uuid_1.v4();
        const getParams = {
            Key: {
                category: "lessons",
                id: lessonId,
            },
            TableName: "rsdrum",
        };
        const lessonData = await db_1.default.get(getParams).promise();
        const lesson = lessonData.Item.info;
        const updatedCommentsInput = lesson.comments.length > 0 ? [...lesson.comments, info] : [info];
        const updateParams = {
            TableName: "rsdrum",
            Key: {
                category: "lessons",
                id: lessonId,
            },
            UpdateExpression: "set info.comments = :comments",
            ExpressionAttributeValues: { ":comments": updatedCommentsInput },
            ReturnValues: "UPDATED_NEW",
        };
        const updatedLessonData = await db_1.default.update(updateParams).promise();
        const updatedComments = updatedLessonData.Attributes.info.comments;
        res.status(200).json({
            message: "Success. Comment posted.",
            updatedComments,
        });
    }
    catch (error) {
        console.log(error);
        if (error.status < 500) {
            res.status(error.status).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Internal server error", error });
        }
    }
});
/***************************
 * GET LESSONS
 **************************/
lessonsRouter.get("/getLessons", userValidation_1.default, async (req, res) => {
    try {
        //Get query specifications for getQueryArgs
        const info = req.query;
        const user = req.user;
        const queryParams = {
            TableName: "rsdrum",
            KeyConditionExpression: "#category = :lessons",
            ExpressionAttributeNames: { "#category": "category" },
            ExpressionAttributeValues: { ":lessons": "lessons" },
            ConsistentRead: true,
        };
        let results = await db_1.default.query(queryParams).promise();
        let lessons = [];
        //function to sort through lessons and send back appropriate data to users. Only assigned lessons and appropriate comments.
        if (info.studentId !== undefined && (info.studentId === user.id || user.admin)) {
            const lessonsResult = results.Items.map((dbEntry) => dbEntry.info);
            lessonsResult.forEach((lesson) => {
                //filters comments so as to not send other users' data, even though it's not displayed on client.
                if (!user.admin) {
                    const filteredComments = lesson.comments.filter((comment) => comment.userId === user.id);
                    lesson.comments = filteredComments;
                }
                lesson.students.forEach((student) => {
                    if (student.id === info.studentId) {
                        lessons.push(lesson);
                    }
                });
            });
        }
        else if (user.admin) {
            lessons = results.Items.map((dbEntry) => dbEntry.info);
        }
        res.status(200).json({ message: "Success.", lessons });
    }
    catch (error) {
        console.log(error);
        if (error.status < 500) {
            res.status(error.status).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Internal server error", error });
        }
    }
});
/***************************
 * UPDATE LESSON
 **************************/
lessonsRouter.put("/updateLesson", userValidation_1.default, async (req, res) => {
    try {
        //get lesson info
        const info = req.body.info;
        //get user info from validation session
        const user = req.user;
        const lessonId = req.body.id;
        //Throw error if user is not an admin
        if (!user.admin) {
            throw new models_1.CustomError(401, "Request failed. Admin privileges required.");
        }
        const updateInfo = utilities_1.updateParamsFn(info);
        const updateParams = {
            TableName: "rsdrum",
            Key: {
                category: "lessons",
                id: lessonId,
            },
            UpdateExpression: updateInfo.setString,
            ExpressionAttributeValues: updateInfo.exAttVals,
            ReturnValues: "UPDATED_NEW",
        };
        const updatedLessonData = await db_1.default.update(updateParams).promise();
        const updatedLesson = updatedLessonData.Attributes.info;
        res.status(200).json({ message: "Successfully updated lesson", updatedLesson });
    }
    catch (error) {
        console.log(error);
        if (error.status < 500) {
            res.status(error.status).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Internal server error", error });
        }
    }
});
/***************************
 * UPDATE ASSIGNMENT
 **************************/
lessonsRouter.put("/updateAssignment", userValidation_1.default, async (req, res) => {
    try {
        //Destructure info to get relevant info for query
        const info = req.body.info;
        const lessonId = req.body.id;
        const user = req.user;
        //Throw error if user is not an admin
        if (!user.admin) {
            throw new models_1.CustomError(401, "Request failed. Admin privileges required.");
        }
        const getParams = {
            Key: {
                category: "lessons",
                id: lessonId,
            },
            TableName: "rsdrum",
        };
        const lessonData = await db_1.default.get(getParams).promise();
        const lesson = lessonData.Item.info;
        const oldAssignment = lesson.assignments.filter((assignment) => assignment.id === info.id);
        const updatedOldAssignment = utilities_1.dynamicObjUpdater(oldAssignment[0], info);
        const newAssignmentsArr = lesson.assignments.map((assignment) => {
            if (assignment.id === updatedOldAssignment.id) {
                return updatedOldAssignment;
            }
            else {
                return assignment;
            }
        });
        const updateParams = {
            TableName: "rsdrum",
            Key: {
                category: "lessons",
                id: lessonId,
            },
            UpdateExpression: "set info.assignments = :assignments",
            ExpressionAttributeValues: { ":assignments": newAssignmentsArr },
            ReturnValues: "UPDATED_NEW",
        };
        const updatedLessonData = await db_1.default.update(updateParams).promise();
        const updatedAssignments = updatedLessonData.Attributes.info.assignments;
        res.status(200).json({ message: "Success", updatedAssignments });
    }
    catch (error) {
        console.log(error);
        if (error.status < 500) {
            res.status(error.status).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Internal server error", error });
        }
    }
});
/***************************
 * UPDATE COMMENT
 **************************/
lessonsRouter.put("/updateComment", userValidation_1.default, async (req, res) => {
    try {
        //Destructure info to get relevant info for query
        const info = req.body.info;
        const lessonId = req.body.id;
        const user = req.user;
        const getParams = {
            Key: {
                category: "lessons",
                id: lessonId,
            },
            TableName: "rsdrum",
        };
        const lessonData = await db_1.default.get(getParams).promise();
        const lesson = lessonData.Item.info;
        const comments = lesson.comments;
        const comment = comments.filter((comment) => comment.id === info.id)[0];
        console.log(comments, comment);
        const updatedComment = utilities_1.dynamicObjUpdater(comment, info);
        const updatedCommentsInput = lesson.comments.map((comment) => {
            if (comment.id === updatedComment.id) {
                return updatedComment;
            }
            else {
                return comment;
            }
        });
        const updateParams = {
            TableName: "rsdrum",
            Key: {
                category: "lessons",
                id: lessonId,
            },
            UpdateExpression: "set info.comments = :comments",
            ExpressionAttributeValues: { ":comments": updatedCommentsInput },
            ReturnValues: "UPDATED_NEW",
        };
        const updatedLessonData = await db_1.default.update(updateParams).promise();
        const updatedComments = updatedLessonData.Attributes.info.comments;
        res.status(200).json({ message: "Success", updatedComments });
    }
    catch (error) {
        console.log(error);
        if (error.status < 500) {
            res.status(error.status).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Internal server error", error });
        }
    }
});
/***************************
 * REMOVE ASSIGNMENT
 **************************/
lessonsRouter.put("/removeAssignment", userValidation_1.default, async (req, res) => {
    try {
        //Destructure info to get relevant info for query
        const info = req.body.info;
        const lessonId = req.body.id;
        const user = req.user;
        //Throw error if user is not an admin
        if (!user.admin) {
            throw new models_1.CustomError(401, "Request failed. Admin privileges required.");
        }
        const getParams = {
            Key: {
                category: "lessons",
                id: lessonId,
            },
            TableName: "rsdrum",
        };
        const lessonData = await db_1.default.get(getParams).promise();
        const lesson = lessonData.Item.info;
        const updatedAssignmentsInput = lesson.assignments.filter((assignment) => assignment.id !== info.id);
        const updateParams = {
            TableName: "rsdrum",
            Key: {
                category: "lessons",
                id: lessonId,
            },
            UpdateExpression: "set info.assignments = :assignments",
            ExpressionAttributeValues: { ":assignments": updatedAssignmentsInput },
            ReturnValues: "UPDATED_NEW",
        };
        const updatedLessonData = await db_1.default.update(updateParams).promise();
        const updatedAssignments = updatedLessonData.Attributes.info.assignments;
        res.status(200).json({ message: "Success", updatedAssignments });
    }
    catch (error) {
        console.log(error);
        if (error.status < 500) {
            res.status(error.status).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Internal server error", error });
        }
    }
});
/***************************
 * REMOVE STUDENT
 **************************/
lessonsRouter.put("/removeStudent", userValidation_1.default, async (req, res) => {
    try {
        //Destructure info to get relevant info for query
        const info = req.body.info;
        const lessonId = req.body.id;
        const user = req.user;
        //Throw error if user is not an admin
        if (!user.admin) {
            throw new models_1.CustomError(401, "Request failed. Admin privileges required.");
        }
        const getParams = {
            Key: {
                category: "lessons",
                id: lessonId,
            },
            TableName: "rsdrum",
        };
        const lessonData = await db_1.default.get(getParams).promise();
        const lesson = lessonData.Item.info;
        const updatedStudentsInput = lesson.students.filter((user) => user.id !== info.id);
        const updateParams = {
            TableName: "rsdrum",
            Key: {
                category: "lessons",
                id: lessonId,
            },
            UpdateExpression: "set info.students = :students",
            ExpressionAttributeValues: { ":students": updatedStudentsInput },
            ReturnValues: "UPDATED_NEW",
        };
        const updatedLessonData = await db_1.default.update(updateParams).promise();
        const updatedStudents = updatedLessonData.Attributes.info.students;
        res.status(200).json({ message: "Success", updatedStudents });
    }
    catch (error) {
        console.log(error);
        if (error.status < 500) {
            res.status(error.status).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Internal server error", error });
        }
    }
});
/***************************
 * REMOVE COMMENT
 **************************/
lessonsRouter.put("/removeComment", userValidation_1.default, async (req, res) => {
    try {
        //Destructure info to get relevant info for query
        const info = req.body.info;
        const lessonId = req.body.id;
        const user = req.user;
        //Throw error if user is not an admin
        if (!user.admin && info.userId !== user.id) {
            throw new models_1.CustomError(401, "Request failed. Must be admin or own this data.");
        }
        const getParams = {
            Key: {
                category: "lessons",
                id: lessonId,
            },
            TableName: "rsdrum",
        };
        const lessonData = await db_1.default.get(getParams).promise();
        const lesson = lessonData.Item.info;
        const updatedCommentsInput = lesson.comments.filter((comment) => comment.id !== info.id);
        const updateParams = {
            TableName: "rsdrum",
            Key: {
                category: "lessons",
                id: lessonId,
            },
            UpdateExpression: "set info.comments = :comments",
            ExpressionAttributeValues: { ":comments": updatedCommentsInput },
            ReturnValues: "UPDATED_NEW",
        };
        const updatedLessonData = await db_1.default.update(updateParams).promise();
        const updatedComments = updatedLessonData.Attributes.info.comments;
        res.status(200).json({ message: "Success", updatedComments });
    }
    catch (error) {
        console.log(error);
        if (error.status < 500) {
            res.status(error.status).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Internal server error", error });
        }
    }
});
/***************************
 * DELETE LESSON
 **************************/
lessonsRouter.delete("/deleteLesson/:id", userValidation_1.default, async (req, res) => {
    try {
        //get id of lesson
        const lessonId = req.params.id;
        //get user id
        const user = req.user;
        //Throw error if not admin
        if (!user.admin) {
            throw new models_1.CustomError(401, "Request failed. Admin privileges required.");
        }
        const params = {
            Key: {
                category: "lessons",
                id: lessonId,
            },
            TableName: "rsdrum",
        };
        await db_1.default.delete(params, () => { });
        res.status(200).json({ message: "Lesson deleted." });
    }
    catch (error) {
        console.log(error);
        if (error.status < 500) {
            res.status(error.status).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Internal server error", error });
        }
    }
});
exports.default = lessonsRouter;
