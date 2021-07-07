"use strict";
// import * as dotenv from "dotenv";
// dotenv.config();
// import { Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import pool from "../db";
// import { User, RequestWithUser } from "../models";
// const validation = async (req: RequestWithUser, res: Response, next: NextFunction) => {
//   if (req.method == "OPTIONS") {
//     next();
//   } else {
//     if (!req.headers.authorization) {
//       //Checks to ensure that there is an authorization token.
//       return res.status(403).json({ message: "Must provide a token.", authorized: false });
//     } else {
//       const token: string = req.headers.authorization;
//       await jwt.verify(token, process.env.JWT_SECRET!, async (err, decoded) => {
//         if (err) {
//           res.status(401).json({ message: "Problem with token", err });
//         }
//         if (decoded) {
//           await pool.query(
//             "SELECT * FROM users WHERE id = $1",
//             [(decoded as { id: string }).id],
//             (err, result) => {
//               if (err) {
//                 res.status(500).json({ message: "Internal Server Error", err });
//               }
//               if (result.rowCount == 0) {
//                 res.status(401).json({ message: "No user with that token." });
//               } else {
//                 const user: User = result.rows[0];
//                 req.user = user;
//                 next();
//               }
//             }
//           );
//         }
//       });
//     }
//   }
// };
// export default validation;
