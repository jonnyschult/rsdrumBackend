"use strict";
// /*
// Tags: ~/tags
// POST/createTag                      => Post Tag**
// GET /getTags                        => Get all tags
// DELETE/deleteTag/:id                => Delete Tag**
//  */
// import * as dotenv from "dotenv";
// dotenv.config();
// import { Router, Response } from "express";
// import pool from "../db";
// import validation from "../middleware/userValidation";
// import { User, RequestWithUser, CustomError, Tag, VideoTag } from "../models";
// import getQueryArgs from "../utilities/getQueryArgsFn";
// import tagChecker from "../utilities/tagCheckerFn";
// const tagsRouter = Router();
// /***************************
//  * CREATE TAG
//  **************************/
// tagsRouter.post("/addTag", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     //Get assignment info
//     const info = req.body.info;
//     const video_id: number = req.body.extraInfo;
//     //Get user info
//     const user: User = req.user!;
//     //Throw error if not an admin
//     if (!user.site_admin) {
//       throw new CustomError(401, "Request failed. Admin privileges required.");
//     }
//     //utility function to check if tag already exists
//     const checkerResults = await tagChecker(info);
//     if (checkerResults.exists) {
//       //Create tag video relation
//       const tagVidoe = await pool.query(`INSERT INTO video_tags (tag_id, video_id) VALUES($1, $2)`, [
//         checkerResults.tag!.id,
//         video_id,
//       ]);
//       res.status(200).json({ message: "Tag found and relation added", newTag: checkerResults.tag });
//     } else {
//       //utility function to get query arguments
//       const { queryString, valArray } = getQueryArgs("insert", "tags", info);
//       //if querystring empty, throw error
//       if (!queryString) {
//         throw new CustomError(400, "Request failed. Query parameters wrong.");
//       }
//       //Adds tag and returns info
//       const result = await pool.query(queryString, valArray);
//       //Throw error if nothing returns
//       if (result.rowCount === 0) {
//         throw new CustomError(400, "Request failed. DB Insertion problem.");
//       }
//       const newTag: Tag = result.rows[0];
//       //Create tag video relation
//       const tagVidoe = await pool.query(`INSERT INTO video_tags (tag_id, video_id) VALUES($1, $2)`, [
//         newTag.id,
//         video_id,
//       ]);
//       res.status(200).json({ message: "Success. Tag saved and relation with video made.", newTag });
//     }
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
//  * GET TAGS
//  **************************/
// tagsRouter.get("/getTags", async (req: RequestWithUser, res: Response) => {
//   try {
//     //Get all tags
//     const result = await pool.query("SELECT * FROM tags");
//     //Put them all in an array named tags
//     const tags: Tag[] = result.rows;
//     res.status(200).json({ message: "Success.", tags });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Internal server error", error });
//   }
// });
// /***************************
//  * DELETE TAG VIDEO RELATION
//  **************************/
// tagsRouter.delete("/deleteTagRelation", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     //Tag id passed as a param.
//     const info = req.query;
//     const user = req.user!;
//     //Checks for admin privileges. Throws error if not admin.
//     if (!user.site_admin) {
//       throw new CustomError(401, "Request failed. Admin privileges required.");
//     }
//     //get query arguments
//     const { queryString, valArray } = getQueryArgs("delete", "video_tags", info);
//     //delete relation
//     await pool.query(queryString, valArray);
//     // check if there are any more videos with that tag id
//     const result = await pool.query("SELECT * FROM video_tags WHERE tag_id = $1", [info.tag_id]);
//     //let front end know if to remove tag
//     let tagDeleted = false;
//     //Delete tag all together if no other video is tagged with it.
//     if (result.rowCount === 0) {
//       await pool.query("DELETE FROM tags WHERE id = $1", [info.tag_id]);
//       tagDeleted = true;
//     }
//     //Deletes tag from DB
//     res.status(200).json({ message: "Tag removed from video.", tagDeleted });
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
//  * DELETE TAG
//  **************************/
// tagsRouter.delete("/deleteTag/:id", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     //Tag id passed as a param.
//     const id = req.params.id;
//     const user = req.user!;
//     //Checks for admin privileges. Throws error if not admin.
//     if (!user.site_admin) {
//       throw new CustomError(401, "Request failed. Admin privileges required.");
//     }
//     //Deletes tag from DB
//     const result = await pool.query("DELETE FROM tags WHERE id = $1", [id]);
//     res.status(200).json({ message: "Tag deleted." });
//   } catch (error) {
//     console.log(error);
//     if (error.status < 500) {
//       res.status(error.status).json({ message: error.message });
//     } else {
//       res.status(500).json({ message: "Internal server error", error });
//     }
//   }
// });
// export default tagsRouter;
