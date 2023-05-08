const { postModel, userModel } = require("../Utils/Schemas.js");
const { buildXML, formatDate } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetPosts",
  needTicket: true,
  levelModerator: 0
};

exports.run = async request => {
  const posts = await postModel.find({ TopicId: request.topicId, IsDeleted: 0 })
  .sort({ _id: -1 })
  .skip(request.pageindex * 10)
  .limit(10);
  
  let postArray = [ ];
  
  for (let post of posts) {   
    const user = await userModel.findOne({ ActorId: post.ActorId });
    
    postArray.push({
      PostId: post.PostId,
      TopicId: post.TopicId,
      Message: post.Message,
      ActorId: post.ActorId,
      PostDate: formatDate(post.PostDate),
      IsDeleted: 0,
      ForumAuthor: {
        ActorId: user.ActorId,
        Name: user.Name
      }
    })
  };
  
  return buildXML("GetPosts", {
    totalRecords: await postModel.countDocuments({ TopicId: request.topicId, IsDeleted: 0 }),
    pageindex: request.pageindex,
    pagesize: 10,
    items: {
      Post: postArray
    }
  });
}