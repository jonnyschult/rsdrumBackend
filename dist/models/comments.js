"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = void 0;
class Comment {
    constructor(comment, read, userId, firstName, response, createdAt, id) {
        this.comment = comment;
        this.read = read;
        this.userId = userId;
        this.firstName = firstName;
        this.response = response;
        this.createdAt = createdAt;
        this.id = id;
    }
}
exports.Comment = Comment;
