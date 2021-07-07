"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = void 0;
class Comment {
    constructor(comment, read, first_name, lesson_id, user_id, created_at, updated_at, id) {
        this.comment = comment;
        this.read = read;
        this.first_name = first_name;
        this.lesson_id = lesson_id;
        this.user_id = user_id;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.id = id;
    }
}
exports.Comment = Comment;
