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

    console.log(info, process.env.MAILGUN_KEY, process.env.MAILGUN_DOMAIN);
    const data: mailgun.messages.SendData = {
      from: `${info.name} ${info.email}`,
      to: "jonathon.schult@gmail.com",
      subject: info.subject,
      text: info.message,
    };
    await mg.messages().send(data, (error, body) => {
      if (error) {
        throw error;
      } else {
        console.log("Body", body);
        res.status(200).json({ message: "Message Sent", body });
      }
    });

    // const auth: nodemailMailgun.Options = {
    //   auth: {
    //     api_key: process.env.MAILGUN_KEY!,
    //     domain: process.env.MAILGUN_DOMAIN!,
    //   },
    // };

    // const transporter = nodemailer.createTransport(nodemailMailgun(auth));

    // const mailOptions: nodemailer.SendMailOptions = {
    //   from: `${info.name} ${info.email}`,
    //   to: "jonathon.schult@gmail.com",
    //   subject: info.subject,
    //   text: info.message,
    // };

    // await transporter.sendMail(mailOptions, (error, success) => {
    //   if (error) {
    //     throw error;
    //   } else {
    //     res.status(200).json({ message: "Message Sent", success });
    //   }
    // });

    // await transporter = nodemailer.createTransport({
    //   service: "Gmail",
    //   auth: {
    //     user: process.env.SERVER_EMAIL,
    //     pass: process.env.SERVER_EMAIL_PASS,
    //   },
    // });

    // // send mail with defined transport object
    // await transporter.sendMail(
    //   {
    //     from: info.email, // sender address
    //     to: "rcschult@comcast.net", // list of receivers
    //     subject: info.subject, // Subject line
    //     text: "Hello world", // plain text body
    //     html: `
    //   <div>
    //       <p>
    //         FROM: <b>${info.name}</b> REPLY TO: <b>${info.email}</b>
    //       </p>
    //       <p>${info.message}</p>
    //     </div>
    //   `, // html body
    //   },
    //   (error, success) => {
    //     if (error) {
    //       throw error;
    //     } else {
    //       res.status(200).json({ message: "Message Sent" });
    //     }
    //   }
    // );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error. Message not sent", error });
  }
});

export default nodemailerRouter;
