"use strict";
// /*
// Videos: ~/videos
// POST/createVideo                => Post video **
// POST/createTag                  => Post video tag**
// GET /getVideos                  => Get all videos
// GET /getTags                    => Get all tags
// PUT/updateVideo/:id             => Update video info**
// DELETE/removeVideo/:id          => Delete video**
// DELETE/removeTag/:id            => Delete video tag**
//  */
// import * as dotenv from "dotenv";
// dotenv.config();
// import { Router, Response } from "express";
// import pool from "../db";
// import validation from "../middleware/userValidation";
// import { User, RequestWithUser, CustomError, Video } from "../models";
// import getQueryArgs from "../utilities/getQueryArgsFn";
// import embedUrlMaker from "../utilities/embedUrlMaker";
// import getTags from "../utilities/getTagsFn";
// import videoTagger from "../utilities/videoTaggerFn";
// import getVideosByTag from "../utilities/getVideosByTag";
// import inactiveTagDeleter from "../utilities/inactiveTagDeleter";
// const videosRouter = Router();
// /***************************
//  * CREATE VIDEOS
//  **************************/
// videosRouter.post("/addVideo", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     //Get video info
//     const info: Video = req.body.info;
//     //Get user info
//     const user: User = req.user!;
//     //Throw error if not an admin
//     if (!user.site_admin) {
//       throw new CustomError(401, "Request failed. Admin privileges required.");
//     }
//     //Utility function to make sure video urls are in embed format
//     const formattedUrl = embedUrlMaker(info.video_url);
//     if (!formattedUrl.success) {
//       throw new CustomError(
//         400,
//         `${formattedUrl} is not a properly formated string. Be sure to either copy and paste from address bar or click "share" and the <> embed/`
//       );
//     } else {
//       info.video_url = formattedUrl.newUrl;
//     }
//     //utility function to get query arguments
//     const { queryString, valArray } = getQueryArgs("insert", "videos", info);
//     //if querystring empty, throw error
//     if (!queryString) {
//       throw new CustomError(400, "Request failed. Query parameters wrong.");
//     }
//     //Adds video and returns info
//     const result = await pool.query(queryString, valArray);
//     //Throw error if nothing returns
//     if (result.rowCount === 0) {
//       throw new CustomError(400, "Request failed. DB Insertion problem.");
//     }
//     //Gets all tags associated with video
//     const { tagRelations, tags } = await getTags(result.rows);
//     //Add tags to the video object
//     const taggedVideos = await videoTagger(result.rows, tags, tagRelations);
//     res.status(200).json({ message: "Success. Video saved", newVideo: taggedVideos[0] });
//   } catch (error) {
//     console.log(error);
//     if (error.status < 500) {
//       res.status(+error.status).json({ message: error.message });
//     } else if (error.code === "23505") {
//       res.status(409).json({ message: "Video already exists", error });
//     } else {
//       res.status(500).json({ message: "Internal server error", error });
//     }
//   }
// });
// /***************************
//  * GET VIDEOS
//  **************************/
// videosRouter.get("/getVideos", async (req: RequestWithUser, res: Response) => {
//   try {
//     const info = req.query;
//     //utility function to get query arguments
//     const { queryString, valArray } = getQueryArgs("select", "videos", info);
//     //if querystring empty, throw error
//     if (!queryString) {
//       throw new CustomError(400, "Request failed. Query parameters wrong.");
//     }
//     //Adds videoCategory and returns info
//     const result = await pool.query(queryString, valArray);
//     //Put them all in an array named videos
//     const videos: Video[] = result.rows;
//     //Gets all tags associated with video
//     const { tagRelations, tags } = await getTags(videos);
//     //Add tags to the video object
//     const taggedVideos = await videoTagger(videos, tags, tagRelations);
//     res.status(200).json({ message: "Success.", videos: taggedVideos });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Internal server error", error });
//   }
// });
// /***************************
//  * GET VIDEOS BY TAG
//  **************************/
// videosRouter.get("/getVideosByTag", async (req: RequestWithUser, res: Response) => {
//   try {
//     const info = req.query;
//     //utility function to get query arguments
//     const videos = await getVideosByTag(+info.tag_id!);
//     //Gets all tags associated with video
//     const { tagRelations, tags } = await getTags(videos);
//     //Add tags to the video object
//     const taggedVideos = await videoTagger(videos, tags, tagRelations);
//     res.status(200).json({ message: "Success.", videos: taggedVideos });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Internal server error", error });
//   }
// });
// /***************************
//  * UPDATE VIDEO
//  **************************/
// videosRouter.put("/updateVideo", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     //get update info to pass in query
//     const info: Video = req.body.info;
//     //get user information
//     const user: User = req.user!;
//     //get id to locate where in database
//     const id = info.id!;
//     //Throw error if not admin
//     if (!user.site_admin) {
//       throw new CustomError(401, "Request failed. Admin privileges required.");
//     }
//     //Utility function to generate query string and values array to be used in pool.query.
//     const { queryString, valArray } = getQueryArgs("update", "videos", info, +id);
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
//     //Gets all tags associated with video
//     const { tagRelations, tags } = await getTags(result.rows);
//     //Add tags to the video object
//     const taggedVideos = await videoTagger(result.rows, tags, tagRelations);
//     res.status(200).json({ message: "Successfully updated video", updatedVideo: taggedVideos[0] });
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
//  * DELETE VIDEO
//  **************************/
// videosRouter.delete("/deleteVideo/:id", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     //Video id passed as a param.
//     const id = req.params.id;
//     const user = req.user!;
//     //Checks for admin privileges. Throws error if not admin.
//     if (!user.site_admin) {
//       throw new CustomError(401, "Request failed. Admin privileges required.");
//     }
//     //Delete tags which will become inactive after video is removed
//     const deletedTagsIds = await inactiveTagDeleter(+id);
//     //Deletes video from DB
//     await pool.query("DELETE FROM videos WHERE id = $1", [id]);
//     res.status(200).json({ message: "Video deleted.", deletedTagsIds });
//   } catch (error) {
//     console.log(error);
//     if (error.status < 500) {
//       res.status(error.status).json({ message: error.message });
//     } else {
//       res.status(500).json({ message: "Internal server error", error });
//     }
//   }
// });
// export default videosRouter;
