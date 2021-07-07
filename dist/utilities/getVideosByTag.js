"use strict";
// import pool from "../db";
// import { Video, VideoTag } from "../models";
// //A function which get all tags associated with a video
// const getVdeosByTag: (tagId: number) => Promise<Video[]> = async (tagId) => {
//   try {
//     const result = await pool.query(`SELECT * FROM video_tags WHERE tag_id = ${tagId}`);
//     const videosOfTag: VideoTag[] = result.rows;
//     const videos: Video[] = await Promise.all(
//       videosOfTag.map(async (videoTag: VideoTag) => {
//         const result = await pool.query(`SELECT * FROM videos WHERE id = ${videoTag.video_id}`);
//         return result.rows[0];
//       })
//     );
//     return videos;
//   } catch (error) {
//     throw error;
//   }
// };
// export default getVdeosByTag;
