"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const updateParamsFn = (updateInfo) => {
    try {
        let setString = "set ";
        let exAttVals = {};
        let index = 0;
        for (const property in updateInfo) {
            const key = property;
            if (index === 0) {
                setString += `info.${property} = :${key}`;
                exAttVals[`:${key}`] = updateInfo[key];
            }
            else {
                setString += `, info.${property} = :${key}`;
                exAttVals[`:${key}`] = updateInfo[key];
            }
            index++;
        }
        return { setString, exAttVals };
    }
    catch (error) {
        throw error;
    }
};
exports.default = updateParamsFn;
