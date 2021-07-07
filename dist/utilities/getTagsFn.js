"use strict";
// import pool from "../db";
// import { Video, Tag, VideoTag } from "../models";
// //Interface to describe the return of the getTags function
// interface GetTagsReturn {
//   tagRelations: VideoTag[];
//   tags: Tag[];
// }
// //A function which get all tags associated with a video
// const getTags: (videos: Video[]) => Promise<GetTagsReturn> = async (videos) => {
//   try {
//     let promiseVideoTagRelationArr: any[] = [];
//     let promiseTagIdsArr: any[] = [];
//     for (const video of videos) {
//       const result = await pool.query(`SELECT * FROM video_tags WHERE video_id = ${video.id}`);
//       if (result.rowCount > 0) {
//         for (let rowItem of result.rows) {
//           promiseVideoTagRelationArr.push(rowItem);
//           if (!promiseTagIdsArr.includes(rowItem.tag_id)) {
//             promiseTagIdsArr.push(rowItem.tag_id);
//           }
//         }
//       }
//     }
//     let [tagRelations, onlyUniqueTagIds] = await Promise.all([promiseVideoTagRelationArr, promiseTagIdsArr]);
//     let tags: Tag[] = await Promise.all(
//       onlyUniqueTagIds.map(async (tagId) => {
//         const result = await pool.query(`SELECT * FROM tags WHERE id = ${tagId}`);
//         return result.rows[0];
//       })
//     );
//     //return object with information.
//     return {
//       tagRelations,
//       tags,
//     };
//   } catch (error) {
//     throw error;
//   }
// };
// export default getTags;
