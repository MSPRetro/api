const { topicModel, postModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "updatePost",
  needTicket: true,
  levelModerator: 1
};

exports.run = async request => {  
  await postModel.updateOne({ PostId: request.post.PostId }, { IsDeleted: 1 });
  
  if (await postModel.countDocuments({ TopicId: request.post.TopicId, IsDeleted: 0 }) == 0) {
    await topicModel.updateOne({ TopicId: request.post.TopicId }, { IsDeleted: 1 })
  };
  
  return buildXML("updatePost");
};