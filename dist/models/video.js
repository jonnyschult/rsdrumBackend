"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Video = void 0;
class Video {
    constructor(video_url, title, description, instructional, tags, created_at, updated_at, id) {
        this.video_url = video_url;
        this.title = title;
        this.description = description;
        this.instructional = instructional;
        this.tags = tags;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.id = id;
    }
}
exports.Video = Video;
