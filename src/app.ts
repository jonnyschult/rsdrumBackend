import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import { headers } from "./middleware/index";
import { usersRouter, lessonsRouter, videosRouter, paymentRouter, nodemailerRouter } from "./routes";

const app = express();

app.use(express.json());
app.use(headers);

app.use("/users", usersRouter);
app.use("/lessons", lessonsRouter);
app.use("/videos", videosRouter);
app.use("/payments", paymentRouter);
app.use("/mailer", nodemailerRouter);

app.listen(process.env.PORT, () => {
  console.log(`Listening on ${process.env.PORT}`);
});
