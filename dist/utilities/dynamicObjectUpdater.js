"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dynmaicObjUpdater = (obj, updateInfo) => {
    try {
        for (const property in updateInfo) {
            const key = property;
            obj[key] = updateInfo[key];
        }
        return obj;
    }
    catch (error) {
        throw error;
    }
};
exports.default = dynmaicObjUpdater;
