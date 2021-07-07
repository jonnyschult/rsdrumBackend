//A function which updates an object dynamically
import { User, Comment, Assignment, Lesson, Video, PackageOption } from "../models";

type Info = { [key: string]: any };

const dynmaicObjUpdater: (obj: Info, updateInfo: Info) => Info = (obj, updateInfo) => {
  try {
    for (const property in updateInfo) {
      const key = property as keyof Info;
      obj[key] = updateInfo[key];
    }

    return obj;
  } catch (error) {
    throw error;
  }
};

export default dynmaicObjUpdater;
