"use strict";
// import * as dotenv from "dotenv";
// dotenv.config();
// import { Router, Response } from "express";
// import pool from "../db";
// // const stripe = require("stripe")(process.env.STRIPE_SECRET);
// import Stripe from "stripe";
// import validation from "../middleware/userValidation";
// import { RequestWithUser, CustomError, PackageOption } from "../models";
// import getQueryArgs from "../utilities/getQueryArgsFn";
// const paymentRouter = Router();
// /***************************
//  * CREATE PAYMENT INTENT
//  **************************/
// paymentRouter.post("/createPaymentIntent", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     //Get assignment info
//     const info = req.body.info;
//     //Create stripe instance
//     const stripe = new Stripe(process.env.STRIPE_SECRET!, { apiVersion: "2020-08-27" });
//     const result = await pool.query("SELECT * FROM packages WHERE id = $1", [info.packageId]);
//     const selectPackage: PackageOption = result.rows[0];
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: +info.quantity * +selectPackage.price,
//       currency: "usd",
//     });
//     res.status(200).json({ message: "Success. Payment information saved.", paymentIntent });
//   } catch (error) {
//     console.log(error);
//     if (error.status < 500) {
//       res.status(error.status).json({ message: error.message });
//     } else {
//       res.status(500).json({ message: "Internal server error", error });
//     }
//   }
// });
// /***************************
//  * SAVE PAYMENT INFO
//  **************************/
// paymentRouter.post("/savePayment", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     //Get assignment info
//     const info = req.body.info;
//     //utility function to get query arguments
//     const { queryString, valArray } = getQueryArgs("insert", "payments", info);
//     //if querystring empty, throw error
//     if (!queryString) {
//       throw new CustomError(400, "Request failed. Query parameters wrong.");
//     }
//     //Insert payment data into database
//     const result = await pool.query(queryString, valArray);
//     //Throw error if nothing returns
//     if (result.rowCount === 0) {
//       throw new CustomError(400, "Request failed. DB Insertion problem.");
//     }
//     const receipt = result.rows[0];
//     res.status(200).json({ message: "Success. Payment information saved.", receipt });
//   } catch (error) {
//     console.log(error);
//     if (error.status < 500) {
//       res.status(error.status).json({ message: error.message });
//     } else {
//       res.status(500).json({ message: "Payment made, but receipt failed to generate.", error });
//     }
//   }
// });
// /***************************
//  * CREATE PACKAGE
//  **************************/
// paymentRouter.post("/createPackage", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     //Get info object from query params
//     const info = req.body.info;
//     const user = req.user!;
//     if (!user.site_admin) {
//       throw new CustomError(401, "Must be admin to perform this action");
//     }
//     //Get query string and valArray dynamically given any or no info object.
//     const { queryString, valArray } = getQueryArgs("insert", "packages", info);
//     //Create packages
//     const result = await pool.query(queryString, valArray);
//     //Create return item
//     const newPackage = result.rows[0];
//     res.status(200).json({ message: "Success.", newPackage });
//   } catch (error) {
//     console.log(error);
//     if (error.status < 500) {
//       res.status(error.status).json({ message: error.message });
//     } else {
//       res.status(500).json({ message: "Internal server error", error });
//     }
//   }
// });
// /***************************
//  * GET PACKAGES
//  **************************/
// paymentRouter.get("/getPackages", async (req: RequestWithUser, res: Response) => {
//   try {
//     //Get info object from query params
//     const info = req.query;
//     //Get query string and valArray dynamically given any or no info object.
//     const { queryString, valArray } = getQueryArgs("select", "packages", info);
//     //Get packages
//     const result = await pool.query(queryString, valArray);
//     //Put them all in an array named packages
//     const packages = result.rows;
//     if (result.rowCount === 0) {
//       res.status(200).json({ message: "No content found.", packages });
//     } else {
//       res.status(200).json({ message: "Success.", packages });
//     }
//   } catch (error) {
//     console.log(error);
//     if (error.status < 500) {
//       res.status(error.status).json({ message: error.message });
//     } else {
//       res.status(500).json({ message: "Internal server error", error });
//     }
//   }
// });
// /***************************
//  * GET RECEIPTS
//  **************************/
// paymentRouter.get("/getReceipts", validation, async (req: RequestWithUser, res: Response) => {
//   try {
//     //Get info object from query params
//     const info = req.query;
//     const user = req.user!;
//     //Get query string and valArray dynamically given any or no info object.
//     const { queryString, valArray } = getQueryArgs("select", "payments", info);
//     //Get all assignments
//     const result = await pool.query(queryString, valArray);
//     //Put them all in an array named receipts
//     const receipts = result.rows;
//     if (result.rowCount === 0) {
//       res.status(200).json({ message: "No content found.", receipts });
//     } else {
//       if (+result.rows[0].user_id !== user.id && !user.site_admin) {
//         throw new CustomError(401, "Must be site admin, or own this data to gain access.");
//       }
//       res.status(200).json({ message: "Success.", receipts });
//     }
//   } catch (error) {
//     console.log(error);
//     if (error.status < 500) {
//       res.status(error.status).json({ message: error.message });
//     } else {
//       res.status(500).json({ message: "Internal server error", error });
//     }
//   }
// });
// /*****************************
// UPDATE PACKAGE
// ****************************/
// paymentRouter.put(
//   "/updatePackage",
//   validation, // Validates user and gives us req.user property
//   async (req: RequestWithUser, res: Response) => {
//     try {
//       //Information to pass to UPDATE DB
//       const info = req.body.info;
//       //Get user info from validation
//       const user = req.user!;
//       //Utility function to get query arguments to pass to DB query
//       const { queryString, valArray } = getQueryArgs("update", "packages", info, info.id); //Utility function to generate query string and values array to be used in pool.query.
//       //if string is empty, throw error
//       if (!queryString) {
//         throw Error;
//       }
//       //Pass UPDATE to package table in DB
//       const result = await pool.query(queryString, valArray);
//       //if nothing is returned, throw and error
//       if (result.rowCount === 0) {
//         throw new CustomError(404, "Request failed. No such item found.");
//       }
//       //Set variable for return data
//       const updatedPackage = result.rows[0];
//       res.status(200).json({ message: "Package Updated", updatedPackage });
//     } catch (error) {
//       console.log(error);
//       if (error.status < 500) {
//         res.status(error.status).json({ message: error.message });
//       } else {
//         res.status(500).json({ message: "Internal server error", error });
//       }
//     }
//   }
// );
// /*****************************
//  * DELETE PACKAGE
//  ****************************/
// paymentRouter.delete(
//   "/deletePackage/:id",
//   validation, // Validates user and gives us req.user property
//   async (req: RequestWithUser, res: Response) => {
//     try {
//       //Id of user to delete
//       const idToRemove = +req.params.id;
//       //Get user set in validation session
//       const user = req.user!;
//       //Throw an error if user is not admin
//       if (!user.site_admin) {
//         throw new CustomError(401, "Must be admin to perform this action");
//       }
//       //Send DELETE query to users table in DB
//       await pool.query("DELETE FROM packages WHERE id = $1", [idToRemove]);
//       res.status(200).json({ message: "Package Deleted" });
//     } catch (error) {
//       console.log(error);
//       if (error.status < 500) {
//         res.status(error.status).json({ message: error.message });
//       } else {
//         res.status(500).json({ message: "Internal server error", error });
//       }
//     }
//   }
// );
// export default paymentRouter;
