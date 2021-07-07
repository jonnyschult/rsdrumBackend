"use strict";
// import pool from "../db";
// import { Tag } from "../models";
// import getQueryArgs from "./getQueryArgsFn";
// interface tagCheckerReturn {
//   exists: boolean;
//   tag: Tag | null;
// }
// //Checks whether a tag exists already and returns it if it does. Prevents duplicate tags.
// const tagChecker: (info: Tag) => Promise<tagCheckerReturn> = async (info) => {
//   try {
//     const { queryString, valArray } = getQueryArgs("select", "tags", info);
//     const result = await pool.query(queryString, valArray);
//     if (result.rowCount > 0) {
//       return { exists: true, tag: result.rows[0] };
//     } else {
//       return { exists: false, tag: null };
//     }
//   } catch (error) {
//     throw error;
//   }
// };
// export default tagChecker;
