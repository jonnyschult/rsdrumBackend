"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db"));
//A function which get all tags associated with a video
const getTags = async (tagId) => {
    try {
        const result = await db_1.default.query(`SELECT * FROM video_tags WHERE tag_id = ${tagId}`);
        const videosOfTag = result.rows;
        const videos = await Promise.all(videosOfTag.map(async (videoTag) => {
            const result = await db_1.default.query(`SELECT * FROM videos WHERE id = ${videoTag.video_id}`);
            return result.rows[0];
        }));
        //return object with information.
        return {
            videos,
        };
    }
    catch (error) {
        throw error;
    }
};
exports.default = getTags;
