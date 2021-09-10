"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//A function which automatically assigns assignments associated with a lesson to the user who is assigned the lesson
const embedUrlMaker = (url) => {
    try {
        let newUrl;
        if (url.includes("embed")) {
            newUrl = url;
        }
        else {
            let watchIndex = url.indexOf("watch") - 1;
            let queryIndex = url.indexOf("=") + 1;
            newUrl = url.substring(0, watchIndex) + "/embed/" + url.substring(queryIndex);
            if (newUrl.includes("&")) {
                let and = url.indexOf("&") - 2;
                newUrl = newUrl.substring(0, and);
            }
        }
        return { success: true, newUrl };
    }
    catch (err) {
        return { success: false, newUrl: url };
    }
};
exports.default = embedUrlMaker;
