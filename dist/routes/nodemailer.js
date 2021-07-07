"use strict";
// import * as dotenv from "dotenv";
// dotenv.config();
// import { Router, Response, Request } from "express";
// import nodemailer from "nodemailer";
// const nodemailerRouter = Router();
// /***************************
//  * CREATE PAYMENT INTENT
//  **************************/
// nodemailerRouter.post("/sendMail", async (req: Request, res: Response) => {
//   try {
//     const info = req.body.info;
//     let transporter = nodemailer.createTransport({
//       service: "Gmail",
//       auth: {
//         user: process.env.SERVER_EMAIL,
//         pass: process.env.SERVER_EMAIL_PASS,
//       },
//     });
//     // send mail with defined transport object
//     await transporter.sendMail(
//       {
//         from: info.email, // sender address
//         to: "rcschult@comcast.net", // list of receivers
//         subject: info.subject, // Subject line
//         text: "Hello world", // plain text body
//         html: `
//       <div>
//           <p>
//             FROM: <b>${info.name}</b> REPLY TO: <b>${info.email}</b>
//           </p>
//           <p>${info.message}</p>
//         </div>
//       `, // html body
//       },
//       (error, success) => {
//         if (error) {
//           throw error;
//         } else {
//           res.status(200).json({ message: "Message Sent" });
//         }
//       }
//     );
//   } catch (error) {
//     res.status(500).json({ message: "Server error. Message not sent", error });
//   }
// });
// export default nodemailerRouter;
