import * as dotenv from "dotenv";
dotenv.config();
import { Router, Response } from "express";
import documentClient from "../db";
import validation from "../middleware/userValidation";
import { User, RequestWithUser, CustomError, Video } from "../models";
import { v4 as uuidV4 } from "uuid";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { updateParamsFn, typeConverter, embedUrlMaker } from "../utilities";

const videosRouter = Router();

/***************************
 * CREATE VIDEOS
 **************************/
videosRouter.post("/addVideo", validation, async (req: RequestWithUser, res: Response) => {
  try {
    //Get video info
    const info: Video = req.body.info;
    //Get user info
    const user: User = req.user!;

    //Throw error if not an admin
    if (!user.admin) {
      throw new CustomError(401, "Request failed. Admin privileges required.");
    }

    //Utility function to make sure video urls are in embed format
    const formattedUrl = embedUrlMaker(info.videoUrl);

    if (!formattedUrl.success) {
      throw new CustomError(
        400,
        `${formattedUrl} is not a properly formated string. Be sure to either copy and paste from address bar or click "share" and the <> embed/`
      );
    } else {
      info.videoUrl = formattedUrl.newUrl;
    }

    // const queryParams: DocumentClient.QueryInput = {
    //   TableName: "rsdrum",
    //   KeyConditionExpression: "#category = :videos",
    //   FilterExpression: "#info.videoUrl = :url",
    //   ExpressionAttributeNames: { "#info": "info", "#category": "category" },
    //   ExpressionAttributeValues: { ":url": info.videoUrl, ":videos": "videos" },
    // };

    // const queryResults = await documentClient.query(queryParams).promise();

    // if (queryResults.Items !== undefined && queryResults.Items.length > 0) {
    //   throw new CustomError(401, "Video already exists.");
    // }

    //create unique id for user
    info.id = uuidV4();

    //Create user Object in DynamoDB
    const putParams: DocumentClient.PutItemInput = {
      Item: {
        category: "videos",
        id: info.id,
        info: info,
      },
      ReturnConsumedCapacity: "TOTAL",
      TableName: "rsdrum",
    };

    await documentClient.put(putParams).promise();

    res.status(200).json({ message: "Success. Video saved", newVideo: info });
  } catch (error) {
    console.log(error);
    if (error.status < 500) {
      res.status(+error.status).json({ message: error.message });
    } else if (error.code === "23505") {
      res.status(409).json({ message: "Video already exists", error });
    } else {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
});

/***************************
 * GET VIDEOS
 **************************/
videosRouter.get("/getVideos", async (req: RequestWithUser, res: Response) => {
  try {
    const info = req.query;

    let results;
    if (Object.entries(info).length > 0) {
      const infoProp = Object.keys(info)[0];
      const infoValue = typeConverter(Object.values(info)[0] as string);

      const queryParams: DocumentClient.QueryInput = {
        TableName: "rsdrum",
        KeyConditionExpression: "#category = :videos",
        FilterExpression: "#info.#prop = :val",
        ExpressionAttributeNames: { "#category": "category", "#info": "info", "#prop": infoProp },
        ExpressionAttributeValues: { ":videos": "videos", ":val": infoValue },
      };

      results = await documentClient.query(queryParams).promise();
    } else {
      const queryParams: DocumentClient.QueryInput = {
        TableName: "rsdrum",
        KeyConditionExpression: "#category = :videos",
        ExpressionAttributeNames: { "#category": "category" },
        ExpressionAttributeValues: { ":videos": "videos" },
      };

      results = await documentClient.query(queryParams).promise();
    }

    const videos = results.Items!.map((dbEntry) => dbEntry.info);
    res.status(200).json({ message: "Success.", videos });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

/***************************
 * GET VIDEOS BY TAG
 **************************/
videosRouter.get("/getVideosByTag", async (req: RequestWithUser, res: Response) => {
  try {
    const info = req.query;

    const queryParams: DocumentClient.QueryInput = {
      TableName: "rsdrum",
      KeyConditionExpression: "#category = :videos",
      ExpressionAttributeNames: { "#category": "category" },
      ExpressionAttributeValues: { ":videos": "videos" },
      ConsistentRead: true,
    };

    const queryResults = await documentClient.query(queryParams).promise();

    const videos = queryResults
      .Items!.map((dbItem) => dbItem.info)
      .filter((video) => video.tags.includes(info.tag));

    res.status(200).json({ message: "Success.", videos });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

/***************************
 * UPDATE VIDEO
 **************************/
videosRouter.put("/updateVideo", validation, async (req: RequestWithUser, res: Response) => {
  try {
    //get update info to pass in query
    const info: Video = req.body.info;
    //get user information
    const user: User = req.user!;
    //get id to locate where in database
    const id = req.body.id;

    //Throw error if not admin
    if (!user.admin) {
      throw new CustomError(401, "Request failed. Admin privileges required.");
    }

    const updateInfo = updateParamsFn(info);

    const updateParams: DocumentClient.UpdateItemInput = {
      TableName: "rsdrum",
      Key: {
        category: "videos",
        id: id,
      },

      UpdateExpression: updateInfo.setString,
      ExpressionAttributeValues: updateInfo.exAttVals,
      ReturnValues: "ALL_NEW",
    };

    const updatedVideoInfo = await documentClient.update(updateParams).promise();
    const updatedVideo = updatedVideoInfo.Attributes!.info;

    res.status(200).json({ message: "Successfully updated video", updatedVideo });
  } catch (error) {
    console.log(error);
    if (error.status < 500) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
});

/***************************
 * DELETE VIDEO
 **************************/
videosRouter.delete("/deleteVideo/:id", validation, async (req: RequestWithUser, res: Response) => {
  try {
    //Video id passed as a param.
    const id = req.params.id;
    const user = req.user!;

    //Checks for admin privileges. Throws error if not admin.
    if (!user.admin) {
      throw new CustomError(401, "Request failed. Admin privileges required.");
    }

    const params: DocumentClient.DeleteItemInput = {
      Key: {
        category: "videos",
        id: id,
      },
      TableName: "rsdrum",
    };
    await documentClient.delete(params, () => {});

    res.status(200).json({ message: "Video deleted." });
  } catch (error) {
    console.log(error);
    if (error.status < 500) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
});

export default videosRouter;
