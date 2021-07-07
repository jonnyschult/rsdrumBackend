"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Video = void 0;
class Video {
    constructor(videoURL, title, description, categoryId, id) {
        this.videoURL = videoURL;
        this.title = title;
        this.description = description;
        this.categoryId = categoryId;
        this.id = id;
    }
}
exports.Video = Video;
