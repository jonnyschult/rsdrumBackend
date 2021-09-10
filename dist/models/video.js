"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Video = void 0;
class Video {
    constructor(videoUrl, title, description, instructional, tags, id) {
        this.videoUrl = videoUrl;
        this.title = title;
        this.description = description;
        this.instructional = instructional;
        this.tags = tags;
        this.id = id;
    }
}
exports.Video = Video;
