import * as dotenv from "dotenv";
dotenv.config();
import express, { Router } from "express";
import { headers } from "./middleware/index";
import { usersRouter, lessonsRouter, videosRouter, paymentRouter, nodemailerRouter } from "./routes";

const app = express();
const router = Router();

app.use(express.json());
app.use(headers);

app.use("/users", usersRouter);
app.use("/lessons", lessonsRouter);
app.use("/videos", videosRouter);
app.use("/payments", paymentRouter);
app.use("/mailer", nodemailerRouter);
app.get("/", (req, res) => {
  console.log("Hello");
  res.status(200).json({ message: "Success" });
});

app.listen(process.env.PORT, () => {
  console.log(`Listening on ${process.env.PORT}`);
});
