import * as dotenv from "dotenv";
dotenv.config();
import { Router, Response, Request } from "express";
import mailgun from "mailgun-js";

const nodemailerRouter = Router();

type message = {
  email: string;
  subject: string;
  name: string;
  message: string;
};

/***************************
 * SEND MAIL
 **************************/
nodemailerRouter.post("/sendMail", async (req: Request, res: Response) => {
  try {
    const info: message = req.body.info;

    const mg = mailgun({ apiKey: process.env.MAILGUN_KEY!, domain: process.env.MAILGUN_DOMAIN! });

    const data: mailgun.messages.SendData = {
      from: `${info.name} ${info.email}`,
      to: "rcschult@comcast.net",
      subject: info.subject,
      text: `${info.message}\n \n Reply to: ${info.email}`,
    };
    await mg.messages().send(data, (error, body) => {
      if (error) {
        throw error;
      } else {
        res.status(200).json({ message: "Message Sent", body });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error. Message not sent", error });
  }
});

export default nodemailerRouter;
