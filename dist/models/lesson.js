"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lesson = void 0;
class Lesson {
    constructor(lessonNumber, lessonLevel, coverImg, title, description, assignments, students, comments, id) {
        this.lessonNumber = lessonNumber;
        this.lessonLevel = lessonLevel;
        this.coverImg = coverImg;
        this.title = title;
        this.description = description;
        this.assignments = assignments;
        this.students = students;
        this.comments = comments;
        this.id = id;
    }
}
exports.Lesson = Lesson;
