"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//add tags to video
const videoTagger = (videos, tags, tagRealtions) => {
    try {
        let taggedVideos = videos.map((video) => {
            let tagsArr = [];
            for (let tagRelation of tagRealtions) {
                if (video.id === tagRelation.video_id) {
                    for (let tag of tags) {
                        if (tag.id === tagRelation.tag_id) {
                            tagsArr.push(tag);
                        }
                    }
                }
            }
            video.tags = tagsArr;
            return video;
        });
        return taggedVideos;
    }
    catch (error) {
        throw error;
    }
};
exports.default = videoTagger;
