"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getQueryArgs = (queryType, table, info, id) => {
    let valArray = [];
    let index = 1;
    if (info.id) {
        delete info.id;
    }
    if (queryType === "update") {
        let setString = "";
        for (const property in info) {
            const key = property;
            if (index === 1) {
                setString += `${property} = $${index}`;
            }
            else {
                setString += `, ${property} = $${index}`;
            }
            valArray.push(info[key]);
            index++;
        }
        let queryString = `UPDATE ${table} SET ${setString} WHERE id = ${id} RETURNING *`;
        return { queryString, valArray };
    }
    if (queryType === "insert") {
        let columns = "";
        let values = "";
        for (const property in info) {
            const key = property;
            if (index == 1) {
                columns += `${property}`;
                values += `$${index} `;
                valArray.push(info[key]);
                index++;
            }
            else {
                columns += `, ${property}`;
                values += `, $${index} `;
                valArray.push(info[key]);
                index++;
            }
        }
        let queryString = `INSERT INTO ${table} (${columns}) VALUES(${values}) RETURNING *`;
        return { queryString, valArray };
    }
    return { queryString: "", valArray: [] };
};
exports.default = getQueryArgs;
