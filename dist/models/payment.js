"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
class Payment {
    constructor(userId, cardHoldersName, email, chargeAmount, itemTitle, purchaseQuantity, chargeDate, numberOfLessons, id) {
        this.userId = userId;
        this.cardHoldersName = cardHoldersName;
        this.email = email;
        this.chargeAmount = chargeAmount;
        this.itemTitle = itemTitle;
        this.purchaseQuantity = purchaseQuantity;
        this.chargeDate = chargeDate;
        this.numberOfLessons = numberOfLessons;
        this.id = id;
    }
}
exports.Payment = Payment;
