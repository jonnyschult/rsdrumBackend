"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeConverter = (string) => {
    if (string === "true" || string === "false") {
        return string === "true";
    }
    const regEx = new RegExp(/^[0-9]*$/);
    if (regEx.test(string)) {
        return +string;
    }
    return string;
};
exports.default = typeConverter;
