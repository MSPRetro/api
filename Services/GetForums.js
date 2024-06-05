const { forumModel, topicModel, postModel } = require("../Utils/Schemas.js");
const { formatDate } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "GetForums",
  needTicket: false,
  levelModerator: 0
};

exports.run = async request => {
  const forums = await forumModel.find({ });
  let forumsArr = [ ];
  
  for (let forum of forums) {    
    let LastPost = await postModel.findOne({ ForumId: forum.ForumId, IsDeleted: 0 })
    .sort({ _id: -1 });
    if (!LastPost) LastPost = { PostDate: formatDate(new Date(0)) };
    
    forumsArr.push({
      ForumId: forum.ForumId,
      Name: forum.Name,
      TopicCount: await topicModel.countDocuments({ ForumId: forum.ForumId, IsDeleted: 0 }),
      PostCount: await postModel.countDocuments({ ForumId: forum.ForumId, IsDeleted: 0 }),
      LastPost: LastPost.PostDate
    });
  };
  
  return buildXML("GetForums", {
    Forum: forumsArr
  });
};