"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(firstName, lastName, email, password, DOB, student, siteAdmin) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.DOB = DOB;
        this.student = student;
        this.siteAdmin = siteAdmin;
    }
}
exports.User = User;
