"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(email, password, DOB, active, student, admin, firstName, lastName, createdAt, updatedAt, id, passwordhash) {
        this.email = email;
        this.password = password;
        this.DOB = DOB;
        this.active = active;
        this.student = student;
        this.admin = admin;
        this.firstName = firstName;
        this.lastName = lastName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.id = id;
        this.passwordhash = passwordhash;
    }
}
exports.User = User;
