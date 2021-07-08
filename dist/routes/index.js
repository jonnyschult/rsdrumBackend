"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodemailerRouter = exports.paymentRouter = exports.videosRouter = exports.lessonsRouter = exports.usersRouter = void 0;
const usersRoute_1 = __importDefault(require("./usersRoute"));
exports.usersRouter = usersRoute_1.default;
const lessonsRoute_1 = __importDefault(require("./lessonsRoute"));
exports.lessonsRouter = lessonsRoute_1.default;
const videosRoute_1 = __importDefault(require("./videosRoute"));
exports.videosRouter = videosRoute_1.default;
const paymentsRoute_1 = __importDefault(require("./paymentsRoute"));
exports.paymentRouter = paymentsRoute_1.default;
const nodemailerRoute_1 = __importDefault(require("./nodemailerRoute"));
exports.nodemailerRouter = nodemailerRoute_1.default;
