"use strict";
/*
Categories: ~/categories
POST/createCategory                => Post Category url**
GET /getCategories                  => Get all categories
DELETE/removeCateogory/:id          => Delete category**
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const userValidation_1 = __importDefault(require("../middleware/userValidation"));
const models_1 = require("../models");
const getQueryArgsFn_1 = __importDefault(require("../utilities/getQueryArgsFn"));
const categoriesRouter = express_1.Router();
/***************************
 * CREATE CATEGORY
 **************************/
categoriesRouter.post("/addCategory", userValidation_1.default, async (req, res) => {
    try {
        //Get assignment info
        const info = req.body.info;
        //Get user info
        const user = req.user;
        //Throw error if not an admin
        if (!user.site_admin) {
            throw new models_1.CustomError(401, "Request failed. Admin privileges required.");
        }
        const { queryString, valArray } = getQueryArgsFn_1.default("insert", "categories", info); //utility function to get query arguments
        //if querystring empty, throw error
        if (!queryString) {
            throw new models_1.CustomError(400, "Request failed. Query parameters wrong.");
        }
        //Adds category and returns info
        const result = await db_1.default.query(queryString, valArray);
        //Throw error if nothing returns
        if (result.rowCount === 0) {
            throw new models_1.CustomError(400, "Request failed. DB Insertion problem.");
        }
        const newCategory = result.rows[0];
        res.status(200).json({ message: "Success. Category saved", newCategory });
    }
    catch (err) {
        if (err.status < 500) {
            res.status(err.status).json({ err });
        }
        else {
            res.status(500).json({ message: "Internal server error", err });
        }
    }
});
/***************************
 * GET Categories
 **************************/
categoriesRouter.get("/getCategories", userValidation_1.default, async (req, res) => {
    try {
        //Get all categories
        const result = await db_1.default.query("SELECT * FROM categories");
        //Put them all in an array named categories
        const categories = result.rows;
        //If no content found, send a 204.
        if (result.rowCount == 0) {
            res.status(204).json({ message: "No content in categories", categories });
        }
        res.status(200).json({ message: "Success.", categories });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error", err });
    }
});
/***************************
 * DELETE CATEGORY
 **************************/
categoriesRouter.delete("/deleteCategorie/:id", userValidation_1.default, async (req, res) => {
    try {
        //Category id passed as a param.
        const id = req.params.id;
        const user = req.user;
        //Checks for admin privileges. Throws error if not admin.
        if (!user.site_admin) {
            throw new models_1.CustomError(401, "Request failed. Admin privileges required.");
        }
        //Deletes category from DB
        const result = await db_1.default.query("DELETE FROM categories WHERE id = $1", [id]);
        res.status(200).json({ message: "Category deleted." });
    }
    catch (err) {
        console.log(err);
        if (err.status < 500) {
            res.status(err.status).json({ err });
        }
        else {
            res.status(500).json({ message: "Internal server error", err });
        }
    }
});
exports.default = categoriesRouter;
