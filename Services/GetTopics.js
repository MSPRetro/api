const { topicModel, postModel, userModel } = require("../Utils/Schemas.js");
const { buildXML, buildPage, formatDate } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetTopics",
  needTicket: true,
  levelModerator: 0
};

exports.run = async request => {
  let topics;
  
  let json;
  let pagesize;
  
  if (request.forumId == -1) {
    json = { IsDeleted: 0 };
    pagesize = 5;
    
    topics = await topicModel.find(json)
    .sort({ _id: -1 })
    .skip(request.pageindex * 5)
    .limit(5);
  }
  else {
    json = { ForumId: request.forumId, IsDeleted: 0 };
    pagesize = 7;
    
    topics = await topicModel.find(json)
    .sort({ _id: -1 })
    .skip(request.pageindex * 7)
    .limit(7);
  };
  
  let topicsArr = [ ];
    
  for (let topic of topics) {
    const user = await userModel.findOne({ ActorId: topic.ActorId });
    
    let LastPost = await postModel.findOne({ TopicId: topic.TopicId, IsDeleted: 0 })
    .sort({ _id: -1 });
    if (!LastPost) LastPost = {
      PostId: 0,
      TopicId: topic.TopicId,
      Message: "",
      ActorId: 1,
      PostDate: formatDate(new Date()),
      IsDeleted: 0
    };
    
    const userPost = await userModel.findOne({ ActorId: LastPost.ActorId });
    
    topicsArr.push({
      TopicId: topic.TopicId,
      ForumId: topic.ForumId,
      Subject: topic.Subject,
      ActorId: topic.ActorId,
      PostCount: await postModel.countDocuments({ TopicId: topic.TopicId, IsDeleted: 0 }),
      LastPostId: LastPost.PostId,
      IsDeleted: topic.IsDeleted,
      Posts: {
        PostId: LastPost.PostId,
        TopicId: topic.TopicId,
        Message: LastPost.Message,
        ActorId: LastPost.ActorId,
        PostDate: formatDate(LastPost.PostDate),
        IsDeleted: 0,
        ForumAuthor: {
          ActorId: userPost.ActorId,
          Name: userPost.Name
        }
      },
      ForumAuthor: {
        ActorId: user.ActorId,
        Name: user.Name
      }
    });
  };
    
  return buildXML("GetTopics", {
    totalRecords: await topicModel.countDocuments(json),
    pageindex: request.pageindex,
    pagesize: pagesize,
    items: {
      Topic: topicsArr
    }
  });
};