const { userModel, friendModel, lookModel } = require("../Utils/Schemas.js");
const { buildXML, buildPage, formatDate } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetHighscoreLook",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => { 
  let lookArray = [ ];
  let totalRecords;
  
  if (request.forFriends) {
    const friends1 = await friendModel.find({ RequesterId: ActorId, Status: 1 });
    const friends2 = await friendModel.find({ ReceiverId: ActorId, Status: 1 });
    
    let FriendData = [ ];
    FriendData.push(ActorId);
    
    for(let friend of friends1) {
      FriendData.push(friend.ReceiverId);
    };
  
    for(let friend of friends2) {
      FriendData.push(friend.RequesterId);
    };
    
    for(let friend of FriendData) {
      if (friend == 1) continue;
      
      const looks = await lookModel.find({ ActorId: friend, State: 0 });
      if (!looks) continue;
      
      const user = await userModel.findOne({ ActorId: friend });
      
      for (let look of looks) {
        lookArray.push({
          LookId: look.LookId,
          ActorId: look.ActorId,
          Created: formatDate(look.Created),
          Headline: look.Headline,
          LookData: look.LookData,
          Likes: look.Likes.length,
          Sells: look.Sells.length,
          ActorName: user.Name
        });
      };
    };
    
    if (request.orderBy === "LIKES") lookArray.sort(function (a, b) {
      return b.Likes - a.Likes;
    });
    else lookArray.sort(function (a, b) {
      return b.Sells - a.Sells;
    });
    
    totalRecords = lookArray.length;
    lookArray = buildPage(request.pageindex, 5, lookArray);
  } else {    
    let looks;
    
    if (request.orderBy === "LIKES") looks = await lookModel.aggregate([
      { $match: { ActorId: { $ne: 1 }, State: 0 } },
      { $addFields: { len: { $size: "$Likes" }}},
      { $sort: { len: -1 }},
      { $skip: request.pageindex * 5 },
      { $limit: 5 }
    ]);
    else looks = await lookModel.aggregate([
      { $match: { ActorId: { $ne: 1 }, State: 0 } },
      { $addFields: { len: { $size: "$Sells" }}},
      { $sort: { len: -1 }},
      { $skip: request.pageindex * 5 },
      { $limit: 5 }
    ]);
    
    totalRecords = await lookModel.countDocuments({ State: 0 });
    
    let leaderboardArray = [ ];    
    
    for (let look of looks) {
      const user = await userModel.findOne({ ActorId: look.ActorId });
      
      lookArray.push({
        LookId: look.LookId,
        ActorId: look.ActorId,
        Created: formatDate(look.Created),
        Headline: look.Headline,
        LookData: look.LookData,
        Likes: look.Likes.length,
        Sells: look.Sells.length,
        ActorName: user.Name
      });
    };
  };
  
  return buildXML("GetHighscoreLook", {
    totalRecords: totalRecords,
    pageindex: request.pageindex,
    pagesize: 5,
    items: {
      HighscoreLook: lookArray
    }
  });
}