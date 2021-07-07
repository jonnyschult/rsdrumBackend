"use strict";
// import pool from "../db";
// import { VideoTag } from "../models";
// //Deletes tag if not video is associated with that tag.
// const inactiveTagDeleter: (videoId: number) => Promise<number[]> = async (videoId) => {
//   try {
//     let deletedTagIds: number[] = [];
//     const result = await pool.query("SELECT * FROM video_tags WHERE video_id = $1", [videoId]);
//     const videoTags: VideoTag[] = result.rows;
//     videoTags.forEach(async (videoTag) => {
//       const videoTagResults = await pool.query("SELECT * FROM video_tags WHERE tag_id = $1", [
//         videoTag.tag_id,
//       ]);
//       if (videoTagResults.rowCount <= 1) {
//         await pool.query("DELETE FROM tags WHERE id = $1", [videoTag.tag_id]);
//         deletedTagIds.push(videoTag.tag_id!);
//       }
//     });
//     return deletedTagIds;
//   } catch (error) {
//     throw error;
//   }
// };
// export default inactiveTagDeleter;
