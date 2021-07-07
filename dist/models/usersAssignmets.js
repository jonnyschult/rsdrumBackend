"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersAssignment = void 0;
class UsersAssignment {
    constructor(student_id, assignment_id, users_lessons_id, completed, created_at, updated_at, id) {
        this.student_id = student_id;
        this.assignment_id = assignment_id;
        this.users_lessons_id = users_lessons_id;
        this.completed = completed;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.id = id;
    }
}
exports.UsersAssignment = UsersAssignment;
