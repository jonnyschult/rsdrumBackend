import * as dotenv from "dotenv";
dotenv.config();
import { Router, Response } from "express";
import Stripe from "stripe";
import documentClient from "../db";
import validation from "../middleware/userValidation";
import { v4 as uuidV4 } from "uuid";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { RequestWithUser, CustomError, PackageOption, Payment } from "../models";
import { updateParamsFn, typeConverter } from "../utilities";

const paymentRouter = Router();

/***************************
 * CREATE PAYMENT INTENT
 **************************/
paymentRouter.post("/createPaymentIntent", validation, async (req: RequestWithUser, res: Response) => {
  try {
    //Get package info
    const info = req.body.info;
    //Create stripe instance
    const stripe = new Stripe(process.env.STRIPE_SECRET!, { apiVersion: "2020-08-27" });

    const getParams: DocumentClient.GetItemInput = {
      TableName: "rsdrum",
      Key: {
        category: "packages",
        id: info.packageId,
      },
    };

    const results = await documentClient.get(getParams).promise();

    const selectedPackage = results.Item!.info;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: +info.quantity * +selectedPackage.price,
      currency: "usd",
    });

    res.status(200).json({ message: "Success. Payment information saved.", paymentIntent });
  } catch (error: any) {
    console.log(error);
    if (error.status !== undefined && error.status < 500 && error.message !== undefined) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
});

/***************************
 * SAVE PAYMENT INFO
 **************************/
paymentRouter.post("/savePayment", validation, async (req: RequestWithUser, res: Response) => {
  try {
    //Get assignment info
    const info = req.body.info;

    info.id = uuidV4();

    const putParams: DocumentClient.PutItemInput = {
      TableName: "rsdrum",
      Item: {
        category: "payments",
        id: info.id,
        info: info,
      },
    };

    await documentClient.put(putParams).promise();

    const receipt = info;
    res.status(200).json({ message: "Success. Payment information saved.", receipt });
  } catch (error: any) {
    console.log(error);
    if (error.status !== undefined && error.status < 500 && error.message !== undefined) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Payment made, but receipt failed to generate.", error });
    }
  }
});

/***************************
 * CREATE PACKAGE
 **************************/
paymentRouter.post("/createPackage", validation, async (req: RequestWithUser, res: Response) => {
  try {
    //Get info object from query params
    const info: PackageOption = req.body.info;
    const user = req.user!;

    if (!user.admin) {
      throw new CustomError(401, "Must be admin to perform this action");
    }

    //create unique id
    info.id = uuidV4();

    //Create package Object in DynamoDB
    const putParams: DocumentClient.PutItemInput = {
      Item: {
        category: "packages",
        id: info.id,
        info: info,
      },
      ReturnConsumedCapacity: "TOTAL",
      TableName: "rsdrum",
    };

    await documentClient.put(putParams).promise();

    res.status(200).json({ message: "Success.", newPackage: info });
  } catch (error: any) {
    console.log(error);
    if (error.status !== undefined && error.status < 500 && error.message !== undefined) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
});

/***************************
 * GET PACKAGES
 **************************/
paymentRouter.get("/getPackages", async (req: RequestWithUser, res: Response) => {
  try {
    //Get info object from query params
    const packageId = req.query.id;

    let packages: PackageOption[];

    if (packageId !== undefined) {
      const getParams: DocumentClient.GetItemInput = {
        TableName: "rsdrum",
        Key: {
          category: "packages",
          id: packageId,
        },
      };
      const results = await documentClient.get(getParams).promise();
      packages = [results.Item!.info as PackageOption];
    } else {
      const queryParams: DocumentClient.QueryInput = {
        TableName: "rsdrum",
        KeyConditionExpression: "#category = :packages",
        ExpressionAttributeNames: { "#category": "category" },
        ExpressionAttributeValues: { ":packages": "packages" },
        ConsistentRead: true,
      };

      const queryResults = await documentClient.query(queryParams).promise();
      packages = queryResults.Items!.map((dbEntry) => dbEntry.info);
    }

    res.status(200).json({ message: "Success.", packages });
  } catch (error: any) {
    console.log(error);
    if (error.status !== undefined && error.status < 500 && error.message !== undefined) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
});

/***************************
 * GET RECEIPTS
 **************************/
paymentRouter.get("/getReceipts", validation, async (req: RequestWithUser, res: Response) => {
  try {
    //Get info object from query params
    const info = req.query;
    const user = req.user!;

    let receipts: Payment[];
    if (Object.entries(info).length > 0) {
      let infoProp = Object.keys(info)[0];
      const infoValue = typeConverter(Object.values(info)[0] as string);

      if (infoProp === "id") {
        const getParams: DocumentClient.GetItemInput = {
          TableName: "rsdrum",
          Key: {
            category: "payments",
            id: infoValue,
          },
        };
        const results = await documentClient.get(getParams).promise();
        receipts = [results.Item!.info];
      } else {
        const queryParams: DocumentClient.QueryInput = {
          TableName: "rsdrum",
          KeyConditionExpression: "#category = :payments",
          FilterExpression: "#info.#prop = :val",
          ExpressionAttributeNames: { "#category": "category", "#info": "info", "#prop": infoProp },
          ExpressionAttributeValues: { ":payments": "payments", ":val": infoValue },
        };

        const queryResults = await documentClient.query(queryParams).promise();
        receipts = queryResults.Items!.map((dbItem) => dbItem.info);
      }
    } else {
      const queryParams: DocumentClient.QueryInput = {
        TableName: "rsdrum",
        KeyConditionExpression: "#category = :payments",
        ExpressionAttributeNames: { "#category": "category" },
        ExpressionAttributeValues: { ":payments": "payments" },
        ConsistentRead: true,
      };

      const queryResults = await documentClient.query(queryParams).promise();
      receipts = queryResults.Items!.map((dbItem) => dbItem.info);
    }

    if (receipts[0] !== undefined && receipts[0].userId !== user.id && !user.admin) {
      throw new CustomError(401, "Must be site admin, or own this data to gain access.");
    }
    res.status(200).json({ message: "Success.", receipts });
  } catch (error: any) {
    console.log(error);
    if (error.status !== undefined && error.status < 500 && error.message !== undefined) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
});

/*****************************
UPDATE PACKAGE
****************************/
paymentRouter.put(
  "/updatePackage",
  validation, // Validates user and gives us req.user property
  async (req: RequestWithUser, res: Response) => {
    try {
      //Information to pass to UPDATE DB
      const info = req.body.info;
      const packageId = req.body.id;
      //Get user info from validation
      const user = req.user!;

      console.log(req.body);

      if (!user.admin) {
        throw new CustomError(401, "Request failed. Admin privileges required.");
      }

      const updateInfo = updateParamsFn(info);

      const updateParams: DocumentClient.UpdateItemInput = {
        TableName: "rsdrum",
        Key: {
          category: "packages",
          id: packageId,
        },

        UpdateExpression: updateInfo.setString,
        ExpressionAttributeValues: updateInfo.exAttVals,
        ReturnValues: "ALL_NEW",
      };

      const updatedPackageData = await documentClient.update(updateParams).promise();
      const updatedPackage = updatedPackageData.Attributes!.info;

      res.status(200).json({ message: "Package Updated", updatedPackage });
    } catch (error: any) {
      console.log(error);
      if (error.status !== undefined && error.status < 500 && error.message !== undefined) {
        res.status(error.status).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error", error });
      }
    }
  }
);

/*****************************
 * DELETE PACKAGE
 ****************************/
paymentRouter.delete("/deletePackage/:id", validation, async (req: RequestWithUser, res: Response) => {
  try {
    //Id of user to delete
    const packageId = req.params.id;
    //Get user set in validation session
    const user = req.user!;

    //Throw an error if user is not admin
    if (!user.admin) {
      throw new CustomError(401, "Must be admin to perform this action");
    }

    const params: DocumentClient.DeleteItemInput = {
      Key: {
        category: "packages",
        id: packageId,
      },
      TableName: "rsdrum",
      ReturnValues: "ALL_OLD",
    };
    const deletionData = await documentClient.delete(params, () => {}).promise();
    const deletedPackage = deletionData.Attributes;
    if (deletedPackage === undefined) {
      throw new CustomError(404, "Package not found. Deletion failed.");
    }

    res.status(200).json({ message: "Package Deleted", deletedPackage });
  } catch (error: any) {
    console.log(error);
    if (error.status !== undefined && error.status < 500 && error.message !== undefined) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
});
export default paymentRouter;
