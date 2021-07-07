"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db"));
//Deletes tag if not video is associated with that tag.
const inactiveTagDeleter = async (videoId) => {
    try {
        let deletedTagIds = [];
        const result = await db_1.default.query("SELECT * FROM video_tags WHERE video_id = $1", [videoId]);
        const videoTags = result.rows;
        videoTags.forEach(async (videoTag) => {
            const videoTagResults = await db_1.default.query("SELECT * FROM video_tags WHERE tag_id = $1", [
                videoTag.tag_id,
            ]);
            if (videoTagResults.rowCount <= 1) {
                await db_1.default.query("DELETE FROM tags WHERE id = $1", [videoTag.tag_id]);
                deletedTagIds.push(videoTag.tag_id);
            }
        });
        return deletedTagIds;
    }
    catch (error) {
        throw error;
    }
};
exports.default = inactiveTagDeleter;
