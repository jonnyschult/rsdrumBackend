"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Assignment = void 0;
class Assignment {
    constructor(assignment_number, title, description, id, lesson_id, created_at, updated_at) {
        this.assignment_number = assignment_number;
        this.title = title;
        this.description = description;
        this.id = id;
        this.lesson_id = lesson_id;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}
exports.Assignment = Assignment;
