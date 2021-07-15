import * as dotenv from "dotenv";
dotenv.config();
import { Router, Response } from "express";
import documentClient from "../db";
import validation from "../middleware/userValidation";
import { v4 as uuidV4 } from "uuid";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { User, RequestWithUser, CustomError, Lesson, Comment } from "../models";
import { updateParamsFn, dynamicObjUpdater } from "../utilities";

const lessonsRouter = Router();

/***************************
 * CREATE LESSON
 **************************/
lessonsRouter.post("/createLesson", validation, async (req: RequestWithUser, res: Response) => {
  try {
    //Get lesson info
    const info: Lesson = req.body.info;
    //Get user info from validation session
    const user: User = req.user!;

    //Throw error if not an admin
    if (!user.admin) {
      throw new CustomError(401, "Request failed. Admin privileges required.");
    }

    //create unique id for lesson and add other attributes.
    info.id = uuidV4();

    //Create user Object in DynamoDB
    const putParams: DocumentClient.PutItemInput = {
      Item: {
        category: "lessons",
        id: info.id,
        info: info,
      },
      ReturnConsumedCapacity: "TOTAL",
      TableName: "rsdrum",
    };

    await documentClient.put(putParams).promise();

    res.status(200).json({ message: "Lesson Created!", newLesson: info });
  } catch (error) {
    if (error.status < 500) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
});

/***************************
 * ADD ASSIGNMENT
 **************************/
lessonsRouter.put("/addAssignment", validation, async (req: RequestWithUser, res: Response) => {
  try {
    //Get admin info
    const admin = req.user!;
    //get users_lessons info
    const info = req.body.info;
    const lessonId = req.body.id;

    //Throw error if not and admin
    if (!admin.admin) {
      throw new CustomError(401, "Request failed. Admin privileges required.");
    }

    info.id = uuidV4();

    const getParams = {
      Key: {
        category: "lessons",
        id: lessonId,
      },
      TableName: "rsdrum",
    };

    const lessonData = await documentClient.get(getParams).promise();

    const lesson: Lesson = lessonData.Item!.info;

    const updatedAssignmentsArr: string[] =
      lesson.assignments!.length > 0 ? [...lesson.assignments!, info] : [info];

    const updateParams: DocumentClient.UpdateItemInput = {
      TableName: "rsdrum",
      Key: {
        category: "lessons",
        id: lessonId,
      },

      UpdateExpression: "set info.assignments = :assignments",
      ExpressionAttributeValues: { ":assignments": updatedAssignmentsArr },
      ReturnValues: "ALL_NEW",
    };

    const updatedLessonData = await documentClient.update(updateParams).promise();
    const updatedAssignments = updatedLessonData.Attributes!.info.assignments;

    res.status(200).json({
      message: "Success. Assignment added to lesson.",
      updatedAssignments,
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

/***************************
 * ADD STUDENT
 **************************/
lessonsRouter.put("/addStudent", validation, async (req: RequestWithUser, res: Response) => {
  try {
    //Get admin info
    const admin = req.user!;
    //get users_lessons info
    const info = req.body.info;
    const lessonId = req.body.id;

    //Throw error if not and admin
    if (!admin.admin) {
      throw new CustomError(401, "Request failed. Admin privileges required.");
    }

    const getParams = {
      Key: {
        category: "lessons",
        id: lessonId,
      },
      TableName: "rsdrum",
    };

    const lessonData = await documentClient.get(getParams).promise();

    const lesson: Lesson = lessonData.Item!.info;

    const updatedStudentsArr: User[] = lesson.students!.length > 0 ? [...lesson.students!, info] : [info];

    const updateParams: DocumentClient.UpdateItemInput = {
      TableName: "rsdrum",
      Key: {
        category: "lessons",
        id: lessonId,
      },

      UpdateExpression: "set info.students = :students",
      ExpressionAttributeValues: { ":students": updatedStudentsArr },
      ReturnValues: "ALL_NEW",
    };

    const updatedLessonData = await documentClient.update(updateParams).promise();
    const updatedStudents = updatedLessonData.Attributes!.info.students;

    res.status(200).json({
      message: "Success. Student assigned lesson.",
      updatedStudents,
    });
  } catch (error) {
    console.log("Add Student Error", error);
    if (error.status < 500) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
});

/***************************
 * ADD COMMENT
 **************************/
lessonsRouter.put("/addComment", validation, async (req: RequestWithUser, res: Response) => {
  try {
    //Get admin info
    const user = req.user!;
    //get users_lessons info
    const info = req.body.info;
    const lessonId = req.body.id;

    //Throw error if not and admin
    if (!user.admin && info.userId !== user.id) {
      throw new CustomError(401, "Request failed. Admin privileges required.");
    }

    info.id = uuidV4();

    const getParams = {
      Key: {
        category: "lessons",
        id: lessonId,
      },
      TableName: "rsdrum",
    };

    const lessonData = await documentClient.get(getParams).promise();

    const lesson: Lesson = lessonData.Item!.info;

    const updatedCommentsInput: string[] = lesson.comments!.length > 0 ? [...lesson.comments!, info] : [info];

    const updateParams: DocumentClient.UpdateItemInput = {
      TableName: "rsdrum",
      Key: {
        category: "lessons",
        id: lessonId,
      },

      UpdateExpression: "set info.comments = :comments",
      ExpressionAttributeValues: { ":comments": updatedCommentsInput },
      ReturnValues: "ALL_NEW",
    };

    const updatedLessonData = await documentClient.update(updateParams).promise();
    const updatedComments = updatedLessonData.Attributes!.info.comments;

    res.status(200).json({
      message: "Success. Comment posted.",
      updatedComments,
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

/***************************
 * GET LESSONS
 **************************/
lessonsRouter.get("/getLessons", validation, async (req: RequestWithUser, res: Response) => {
  try {
    //Get query specifications for getQueryArgs
    const info = req.query;
    const user: User = req.user!;

    const queryParams: DocumentClient.QueryInput = {
      TableName: "rsdrum",
      KeyConditionExpression: "#category = :lessons",
      ExpressionAttributeNames: { "#category": "category" },
      ExpressionAttributeValues: { ":lessons": "lessons" },
      ConsistentRead: true,
    };

    let results = await documentClient.query(queryParams).promise();

    let lessons: Lesson[] = [];

    //function to sort through lessons and send back appropriate data to users. Only assigned lessons and appropriate comments.
    if (info.studentId !== undefined && (info.studentId === user.id || user.admin)) {
      const lessonsResult: Lesson[] = results.Items!.map((dbEntry) => dbEntry.info);
      lessonsResult.forEach((lesson) => {
        //filters comments so as to not send other users' data, even though it's not displayed on client.
        if (!user.admin) {
          const filteredComments = lesson.comments!.filter((comment) => comment.userId === user.id);
          lesson.comments = filteredComments;
        }
        lesson.students!.forEach((student: User) => {
          if (student.id === info.studentId) {
            lessons.push(lesson);
          }
        });
      });
    } else if (user.admin) {
      lessons = results.Items!.map((dbEntry) => dbEntry.info);
    }

    res.status(200).json({ message: "Success.", lessons });
  } catch (error) {
    console.log(error);
    if (error.status < 500) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
});

/***************************
 * UPDATE LESSON
 **************************/
lessonsRouter.put("/updateLesson", validation, async (req: RequestWithUser, res: Response) => {
  try {
    //get lesson info
    const info: Lesson = req.body.info;
    //get user info from validation session
    const user: User = req.user!;
    const lessonId = req.body.id;

    //Throw error if user is not an admin
    if (!user.admin) {
      throw new CustomError(401, "Request failed. Admin privileges required.");
    }

    const updateInfo = updateParamsFn(info);

    const updateParams: DocumentClient.UpdateItemInput = {
      TableName: "rsdrum",
      Key: {
        category: "lessons",
        id: lessonId,
      },

      UpdateExpression: updateInfo.setString,
      ExpressionAttributeValues: updateInfo.exAttVals,
      ReturnValues: "ALL_NEW",
    };

    const updatedLessonData = await documentClient.update(updateParams).promise();
    const updatedLesson = updatedLessonData.Attributes!.info;

    res.status(200).json({ message: "Successfully updated lesson", updatedLesson });
  } catch (error) {
    console.log(error);
    if (error.status < 500) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
});

/***************************
 * UPDATE ASSIGNMENT
 **************************/
lessonsRouter.put("/updateAssignment", validation, async (req: RequestWithUser, res: Response) => {
  try {
    //Destructure info to get relevant info for query
    const info = req.body.info;
    const lessonId = req.body.id;
    const user = req.user!;

    //Throw error if user is not an admin
    if (!user.admin) {
      throw new CustomError(401, "Request failed. Admin privileges required.");
    }

    const getParams = {
      Key: {
        category: "lessons",
        id: lessonId,
      },
      TableName: "rsdrum",
    };

    const lessonData = await documentClient.get(getParams).promise();

    const lesson: Lesson = lessonData.Item!.info;

    const oldAssignment = lesson.assignments!.filter((assignment) => assignment.id === info.id);

    const updatedOldAssignment = dynamicObjUpdater(oldAssignment[0], info);

    const newAssignmentsArr = lesson.assignments!.map((assignment) => {
      if (assignment.id === updatedOldAssignment.id) {
        return updatedOldAssignment;
      } else {
        return assignment;
      }
    });

    const updateParams: DocumentClient.UpdateItemInput = {
      TableName: "rsdrum",
      Key: {
        category: "lessons",
        id: lessonId,
      },

      UpdateExpression: "set info.assignments = :assignments",
      ExpressionAttributeValues: { ":assignments": newAssignmentsArr },
      ReturnValues: "ALL_NEW",
    };

    const updatedLessonData = await documentClient.update(updateParams).promise();
    const updatedAssignments = updatedLessonData.Attributes!.info.assignments;

    res.status(200).json({ message: "Success", updatedAssignments });
  } catch (error) {
    console.log(error);
    if (error.status < 500) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
});

/***************************
 * UPDATE COMMENT
 **************************/
lessonsRouter.put("/updateComment", validation, async (req: RequestWithUser, res: Response) => {
  try {
    //Destructure info to get relevant info for query
    const info = req.body.info;
    const lessonId = req.body.id;
    const user = req.user!;

    const getParams = {
      Key: {
        category: "lessons",
        id: lessonId,
      },
      TableName: "rsdrum",
    };

    const lessonData = await documentClient.get(getParams).promise();

    const lesson = lessonData.Item!.info;

    const comments: Comment[] = lesson.comments;

    const comment = comments!.filter((comment) => comment.id === info.id)[0];
    console.log(comments, comment);

    const updatedComment = dynamicObjUpdater(comment, info);

    const updatedCommentsInput = lesson.comments!.map((comment: Comment) => {
      if (comment.id === updatedComment.id) {
        return updatedComment;
      } else {
        return comment;
      }
    });

    const updateParams: DocumentClient.UpdateItemInput = {
      TableName: "rsdrum",
      Key: {
        category: "lessons",
        id: lessonId,
      },

      UpdateExpression: "set info.comments = :comments",
      ExpressionAttributeValues: { ":comments": updatedCommentsInput },
      ReturnValues: "ALL_NEW",
    };

    const updatedLessonData = await documentClient.update(updateParams).promise();
    const updatedComments = updatedLessonData.Attributes!.info.comments;

    res.status(200).json({ message: "Success", updatedComments });
  } catch (error) {
    console.log(error);
    if (error.status < 500) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
});

/***************************
 * REMOVE ASSIGNMENT
 **************************/
lessonsRouter.put("/removeAssignment", validation, async (req: RequestWithUser, res: Response) => {
  try {
    //Destructure info to get relevant info for query
    const info = req.body.info;
    const lessonId = req.body.id;
    const user = req.user!;

    //Throw error if user is not an admin
    if (!user.admin) {
      throw new CustomError(401, "Request failed. Admin privileges required.");
    }

    const getParams = {
      Key: {
        category: "lessons",
        id: lessonId,
      },
      TableName: "rsdrum",
    };

    const lessonData = await documentClient.get(getParams).promise();

    const lesson: Lesson = lessonData.Item!.info;

    const updatedAssignmentsInput = lesson.assignments!.filter((assignment) => assignment.id !== info.id);

    const updateParams: DocumentClient.UpdateItemInput = {
      TableName: "rsdrum",
      Key: {
        category: "lessons",
        id: lessonId,
      },

      UpdateExpression: "set info.assignments = :assignments",
      ExpressionAttributeValues: { ":assignments": updatedAssignmentsInput },
      ReturnValues: "ALL_NEW",
    };

    const updatedLessonData = await documentClient.update(updateParams).promise();
    const updatedAssignments = updatedLessonData.Attributes!.info.assignments;

    res.status(200).json({ message: "Success", updatedAssignments });
  } catch (error) {
    console.log(error);
    if (error.status < 500) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
});

/***************************
 * REMOVE STUDENT
 **************************/
lessonsRouter.put("/removeStudent", validation, async (req: RequestWithUser, res: Response) => {
  try {
    //Destructure info to get relevant info for query
    const info = req.body.info;
    const lessonId = req.body.id;
    const user = req.user!;

    //Throw error if user is not an admin
    if (!user.admin) {
      throw new CustomError(401, "Request failed. Admin privileges required.");
    }

    const getParams = {
      Key: {
        category: "lessons",
        id: lessonId,
      },
      TableName: "rsdrum",
    };

    const lessonData = await documentClient.get(getParams).promise();

    const lesson: Lesson = lessonData.Item!.info;

    const updatedStudentsInput: User[] = lesson.students!.filter((user) => user.id !== info.id);

    const updateParams: DocumentClient.UpdateItemInput = {
      TableName: "rsdrum",
      Key: {
        category: "lessons",
        id: lessonId,
      },

      UpdateExpression: "set info.students = :students",
      ExpressionAttributeValues: { ":students": updatedStudentsInput },
      ReturnValues: "ALL_NEW",
    };

    const updatedLessonData = await documentClient.update(updateParams).promise();
    const updatedStudents = updatedLessonData.Attributes!.info.students;

    res.status(200).json({ message: "Success", updatedStudents });
  } catch (error) {
    console.log(error);
    if (error.status < 500) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
});

/***************************
 * REMOVE COMMENT
 **************************/
lessonsRouter.put("/removeComment", validation, async (req: RequestWithUser, res: Response) => {
  try {
    //Destructure info to get relevant info for query
    const info = req.body.info;
    const lessonId = req.body.id;
    const user = req.user!;

    //Throw error if user is not an admin
    if (!user.admin && info.userId !== user.id) {
      throw new CustomError(401, "Request failed. Must be admin or own this data.");
    }

    const getParams = {
      Key: {
        category: "lessons",
        id: lessonId,
      },
      TableName: "rsdrum",
    };

    const lessonData = await documentClient.get(getParams).promise();

    const lesson: Lesson = lessonData.Item!.info;

    const updatedCommentsInput = lesson.comments!.filter((comment) => comment.id !== info.id);

    const updateParams: DocumentClient.UpdateItemInput = {
      TableName: "rsdrum",
      Key: {
        category: "lessons",
        id: lessonId,
      },

      UpdateExpression: "set info.comments = :comments",
      ExpressionAttributeValues: { ":comments": updatedCommentsInput },
      ReturnValues: "ALL_NEW",
    };

    const updatedLessonData = await documentClient.update(updateParams).promise();
    const updatedComments = updatedLessonData.Attributes!.info.comments;

    res.status(200).json({ message: "Success", updatedComments });
  } catch (error) {
    console.log(error);
    if (error.status < 500) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
});

/***************************
 * DELETE LESSON
 **************************/
lessonsRouter.delete("/deleteLesson/:id", validation, async (req: RequestWithUser, res: Response) => {
  try {
    //get id of lesson
    const lessonId = req.params.id;
    //get user id
    const user = req.user!;

    //Throw error if not admin
    if (!user.admin) {
      throw new CustomError(401, "Request failed. Admin privileges required.");
    }

    const params: DocumentClient.DeleteItemInput = {
      Key: {
        category: "lessons",
        id: lessonId,
      },
      TableName: "rsdrum",
    };
    await documentClient.delete(params, () => {});

    res.status(200).json({ message: "Lesson deleted." });
  } catch (error) {
    console.log(error);
    if (error.status < 500) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
});

export default lessonsRouter;
