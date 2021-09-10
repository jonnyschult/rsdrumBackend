"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tag = void 0;
class Tag {
    constructor(tag_name, created_at, updated_at, id, video_id) {
        this.tag_name = tag_name;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.id = id;
        this.video_id = video_id;
    }
}
exports.Tag = Tag;
