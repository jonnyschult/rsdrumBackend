"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
class Message {
    constructor(message, subject, read, sender_id, recipients_id, parent_message_id, id, created_at, updated_at) {
        this.message = message;
        this.subject = subject;
        this.read = read;
        this.sender_id = sender_id;
        this.recipients_id = recipients_id;
        this.parent_message_id = parent_message_id;
        this.id = id;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}
exports.Message = Message;
