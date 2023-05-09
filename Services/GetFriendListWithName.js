const { friendModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetFriendListWithName",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  // const friends = await friendModel.find({ RequesterId: ActorId, Status: 1 });
  // const friends1 = await friendModel.find({ ReceiverId: ActorId, Status: 1 });
  
  const friends1 = await friendModel.aggregate([
    { $match: {
      RequesterId: ActorId,
      Status: 1
    }},
    { $lookup: {
      from: "users",
      localField: "ReceiverId",
      foreignField: "ActorId",
      as: "user"
    }},
    { $unwind: "$user" } 
  ]);
  
  const friends2 = await friendModel.aggregate([
    { $match: {
      ReceiverId: ActorId,
      Status: 1
    }},
    { $lookup: {
      from: "users",
      localField: "RequesterId",
      foreignField: "ActorId",
      as: "user"
    }},
    { $unwind: "$user" }
  ]);

  let FriendData = [ ];
  
  for (let friend of friends1) {
    FriendData.push({
      actorId: friend.user.ActorId,
      name: friend.user.Name
    });
  }
  
  for (let friend of friends2) {
    FriendData.push({
      actorId: friend.user.ActorId,
      name: friend.user.Name
    });
  }
      
  return buildXML("GetFriendListWithName", {
    FriendData: FriendData 
  });
};