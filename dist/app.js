"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_1 = __importDefault(require("express"));
const index_1 = require("./middleware/index");
const routes_1 = require("./routes");
const app = express_1.default();
app.use(express_1.default.json());
app.use(index_1.headers);
app.use("/test", routes_1.testRouter);
// app.use("/users", usersRouter);
// app.use("/lessons", lessonsRouter);
// app.use("/assignments", assignmentsRouter);
// app.use("/videos", videosRouter);
// app.use("/comments", commentsRouter);
// app.use("/tags", tagsRouter);
// app.use("/payments", paymentRouter);
// app.use("/mailer", nodemailerRouter);
// var params = {
//   Key: {
//     id: {
//       S: "asdf-fdsa-blah-yoyo",
//     },
//     category: {
//       S: "comments",
//     },
//   },
//   TableName: "rsdrum",
// };
// dynamodb.getItem(params, function (err, data) {
//   if (err) console.log(err, err.stack);
//   // an error occurred
//   else {
//     const info: any = data.Item!.comments_list.L![0].M;
//     console.log(info); // successful response
//   }
// });
app.listen(process.env.PORT, () => {
    console.log(`Listening on ${process.env.PORT}`);
});
