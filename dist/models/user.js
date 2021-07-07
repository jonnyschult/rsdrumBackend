"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(email, password, date_of_birth, active, student, site_admin, first_name, last_name, created_at, updated_at, id, passwordhash) {
        this.email = email;
        this.password = password;
        this.date_of_birth = date_of_birth;
        this.active = active;
        this.student = student;
        this.site_admin = site_admin;
        this.first_name = first_name;
        this.last_name = last_name;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.id = id;
        this.passwordhash = passwordhash;
    }
}
exports.User = User;
