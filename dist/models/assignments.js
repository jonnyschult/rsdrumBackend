"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Assignment = void 0;
class Assignment {
    constructor(assignmentNumber, title, description, primaryImg, auxImg, url, linkName, id) {
        this.assignmentNumber = assignmentNumber;
        this.title = title;
        this.description = description;
        this.primaryImg = primaryImg;
        this.auxImg = auxImg;
        this.url = url;
        this.linkName = linkName;
        this.id = id;
    }
}
exports.Assignment = Assignment;
