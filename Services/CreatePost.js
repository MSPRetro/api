const { topicModel, postModel } = require("../Utils/Schemas.js");
const { buildXML, getNewId } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "CreatePost",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {  
  const topic = await topicModel.findOne({ TopicId: request.topicId });
  if (!topic) return;
  
  let PostId = await getNewId("post_id") + 1;
  
  const post = new postModel({
    PostId: PostId,
    TopicId: topic.TopicId,
    ForumId: topic.ForumId,
    ActorId: ActorId,
    Message: request.message,
    PostDate: new Date(),
    IsDeleted: 0
  });
  await post.save();
  
  return buildXML("CreatePost");
};