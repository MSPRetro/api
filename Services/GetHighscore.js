const { userModel, friendModel } = require("../Utils/Schemas.js");
const { buildXML, buildPage, buildLevel } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetHighscore",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  let leaderboardArray = [ ];
  let totalRecords;
  
  if (request.forFriends) {
    const friends1 = await friendModel.find({ RequesterId: ActorId, Status: 1 });
    const friends2 = await friendModel.find({ ReceiverId: ActorId, Status: 1 });
    
    let FriendData = [ ];
    FriendData.push(await userModel.findOne({ ActorId: ActorId }));
    
    for(let f = 0; f < friends1.length; f++) {
      FriendData.push(await userModel.findOne({ ActorId: friends1[f].ReceiverId }));
    };
  
    for(let j = 0; j < friends2.length; j++) {
      FriendData.push(await userModel.findOne({ ActorId: friends2[j].RequesterId }));
    };
    
    switch (request.orderBy) {
      case "LEVEL":
        FriendData.sort((a, b) => b.Progression.Fame - a.Progression.Fame);
        
        /* TODO: Try to make a MongoDB query to improve the performance
        
        console.log(ActorId)
        
        const a = await friendModel.aggregate([
          {
            $match: {
              or: [
               {
                 RequesterId: ActorId,
                 Status: 1
               },
               {
                 ReceiverId: ActorId,
                 Status: 1
               }
              ]
            }
          },
          {
            $set: {
              fieldResult: {
                $cond: {
                  if: {
                    $eq: [ "$ReceiverId", ActorId ]
                  },
                  then: "$RequesterId",
                  else: "$ReceiverId"
                }
              }
            }
          },
          {
            $lookup: {
              from: "users",
              localField: "fieldResult",
              foreignField: "ActorId",
              as: "user"
            }
          },
          {
            $project: {
              ActorId: "$user.ActorId",
              Name: "$user.Name",
              Fame: "$user.Progression.Fame",
              Money: "$user.Progression.Money",
              Fortune: "$user.Progression.Fortune",
              IsExtra: "$user.Extra.IsExtra",
              RoomLikes: "$user.Room.RoomActorLikes"
            }
          },
          { $sort: { "Fame": -1 } },
          { $skip: request.pageindex * 7 },
          { $limit: 7 }
        ]);
        
        console.log(a);
        */

        break;
      case "FORTUNE":
        FriendData.sort((a, b) => b.Progression.Fortune - a.Progression.Fortune);
        
        break;
      case "ROOMLIKES":
        FriendData.sort((a, b) => b.Room.RoomActorLikes.length - a.Room.RoomActorLikes.length);
        
        break;
      default:
        return;
    };
    
    for (let friend of FriendData) {
      if (friend.ActorId == 1) continue;
      
      leaderboardArray.push({
        ActorId: friend.ActorId,
        Name: friend.Name,
        Level: buildLevel(friend.Progression.Fame),
        Money: friend.Progression.Money,
        Fame: friend.Progression.Fame,
        Fortune: friend.Progression.Fortune,
        FriendCount: 0,
        IsExtra: friend.Extra.IsExtra,
        RoomLikes: friend.Room.RoomActorLikes.length
      })
    }
    
    totalRecords = leaderboardArray.length;
    leaderboardArray = buildPage(request.pageindex, 7, leaderboardArray);
  } else {
    let users;
        
    switch (request.orderBy) {
      case "LEVEL":
        users = await userModel.find({ ActorId: { $ne: 1 }, "Extra.IsExtra": 0 })
          .sort({ "Progression.Fame": -1 })
          .skip(request.pageindex * 7)
          .limit(7);
        
        break;
      case "FORTUNE":
        users = await userModel.find({ ActorId: { $ne: 1 }, "Extra.IsExtra": 0 })
          .sort({ "Progression.Fortune": -1 })
          .skip(request.pageindex * 7)
          .limit(7);
        
        break;
      case "ROOMLIKES":       
        users = await userModel.aggregate([
          { $match: { ActorId: { $ne: 1 }, "Extra.IsExtra": 0 }},
          { $addFields: { len: { $size: "$Room.RoomActorLikes" }}},
          { $sort: { len: -1 }},
          { $skip: request.pageindex * 7 },
          { $limit: 7 }
        ]);
        
        break;
      default:
        return;
    };
    
    for (let user of users) {
      leaderboardArray.push({
        ActorId: user.ActorId,
        Name: user.Name,
        Level: buildLevel(user.Progression.Fame),
        Money: user.Progression.Money,
        Fame: user.Progression.Fame,
        Fortune: user.Progression.Fortune,
        FriendCount: 0,
        IsExtra: user.Extra.IsExtra,
        RoomLikes: user.Room.RoomActorLikes.length
      })
    };
    
    totalRecords = await userModel.countDocuments({ "Extra.IsExtra": 0 });
  };
  
  return buildXML("GetHighscore", {
    totalRecords: totalRecords,
    pageindex: request.pageindex,
    pagesize: 7,
    items: {
      ActorHighscore: leaderboardArray
    }
  })
}