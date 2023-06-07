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
    const pipeline = ([
      {
        $match: {
          $or: [
            { RequesterId: 2 },
            { ReceiverId: 2 }
          ], 
          Status: 1
        }
      }, {
        $lookup: {
          from: "users", 
          let: {
            actorId: {
              $cond: [
                {
                  $eq: [
                    "$RequesterId", ActorId
                  ]
                }, "$ReceiverId", "$RequesterId"
              ]
            }
          }, 
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    {
                      $eq: [
                        "$$actorId", "$ActorId"
                      ]
                    }
                  ]
                }
              }
            }
          ], 
          as: "friends"
        }
      }, {
        $unwind: "$friends"
      }, {
        $replaceRoot: {
          newRoot: "$friends"
        }
      }, {
        $unionWith: {
          coll: "users", 
          pipeline: [
            {
              $match: {
                ActorId: ActorId
              }
            }
          ]
        }
      }, {
        $match: {
          ActorId: {
            $ne: 1
          }, 
          "Extra.IsExtra": 0
        }
      }, {
        $project: {
          _id: 0, 
          ActorId: "$ActorId", 
          Name: "$Name", 
          Money: "$Progression.Money", 
          Fame: "$Progression.Fame", 
          Fortune: "$Progression.Fortune", 
          IsExtra: "$Extra.IsExtra", 
          RoomLikes: {
            $size: "$Room.RoomActorLikes"
          }
        }
      }, {
        $sort: {
          Fame: -1
        }
      }, {
        $facet: {
          users: [
            {
              $skip: request.pageindex * 7
            }, {
              $limit: 7
            }
          ], 
          totalCount: [{
              $count: "count"
            }]
        }
      }, {
        $project: {
          users: 1, 
          totalCount: {
            $arrayElemAt: [
              "$totalCount.count", 0
            ]
          }
        }
      }
    ]);
    
    let sortStage = pipeline.find(stage => stage.hasOwnProperty("$sort"));
    
    switch (request.orderBy) {
      // the pipeline is LEVEL by default
      case "FORTUNE":
        sortStage.$sort = { Fortune: -1 };
        
        break;
      case "ROOMLIKES":
        sortStage.$sort = { RoomLikes: -1 };
        
        break;
    };
    
    let FriendData = await friendModel.aggregate(pipeline);
    FriendData = FriendData[0];
    
    for (let friend of FriendData.users) {      
      leaderboardArray.push({
        ActorId: friend.ActorId,
        Name: friend.Name,
        Level: buildLevel(friend.Fame),
        Money: friend.Money,
        Fame: friend.Fame,
        Fortune: friend.Fortune,
        FriendCount: 0,
        IsExtra: friend.IsExtra,
        RoomLikes: friend.RoomLikes
      })
    }
    
    totalRecords = FriendData.totalCount;
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