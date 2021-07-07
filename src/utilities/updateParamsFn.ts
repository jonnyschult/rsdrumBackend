//A function which creates an update expression for dynamoDB
import { User, Comment, Assignment, Lesson, Video, PackageOption } from "../models";

type Info = User | Comment | Assignment | Lesson | Video | PackageOption;

const updateParamsFn: (updateInfo: Info) => { setString: string; exAttVals: { [key: string]: any } } = (
  updateInfo
) => {
  try {
    let setString: string = "set ";
    let exAttVals: { [key: string]: any } = {};
    let index: number = 0;

    for (const property in updateInfo) {
      const key = property as keyof Info;
      if (index === 0) {
        setString += `info.${property} = :${key}`;
        exAttVals[`:${key}`] = updateInfo[key];
      } else {
        setString += `, info.${property} = :${key}`;
        exAttVals[`:${key}`] = updateInfo[key];
      }
      index++;
    }

    return { setString, exAttVals };
  } catch (error) {
    throw error;
  }
};

export default updateParamsFn;
