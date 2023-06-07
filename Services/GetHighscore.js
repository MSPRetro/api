const { userModel, friendModel } = require("../Utils/Schemas.js");
const { buildXML, buildLevel } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetHighscore",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  let leaderboardArray = [ ];
  let userData;
  
  if (request.forFriends) {
    const pipeline = [
      {
        $match: {
          $or: [
            { RequesterId: ActorId },
            { ReceiverId: ActorId }
          ], 
          Status: 1
        }
      },
      {
        $lookup: {
          from: "users", 
          let: {
            actorId: {
              $cond: [
                {
                  $eq: [ "$RequesterId", ActorId ]
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
                      $eq: [ "$$actorId", "$ActorId" ]
                    }
                  ]
                }
              }
            }
          ], 
          as: "friends"
        }
      },
      {
        $unwind: "$friends"
      },
      {
        $replaceRoot: {
          newRoot: "$friends"
        }
      },
      {
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
      },
      {
        $match: {
          ActorId: { $ne: 1 }
        }
      },
      {
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
      },
      {
        $sort: { Fame: -1 }
      },
      {
        $facet: {
          users: [
            { $skip: request.pageindex * 7 },
            { $limit: 7 }
          ], 
          totalCount: [{ $count: "count" }]
        }
      },
      {
        $project: {
          users: 1, 
          totalCount: {
            $arrayElemAt: [ "$totalCount.count", 0 ]
          }
        }
      }
    ];
    
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
    
    userData = await friendModel.aggregate(pipeline);
  } else {
    const pipeline = [
      {
        $match: {
          ActorId: { $ne: 1 },
          "Extra.IsExtra": 0
        }
      },
      {
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
      },
      {
        $sort: { Fame: -1 }
      },
      {
        $facet: {
          users: [
            { $skip: request.pageindex * 7 },
            { $limit: 7 }
          ], 
          totalCount: [{ $count: "count" }]
        }
      },
      {
        $project: {
          users: 1, 
          totalCount: {
            $arrayElemAt: [ "$totalCount.count", 0 ]
          }
        }
      }
    ];
    
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
    
    userData = await userModel.aggregate(pipeline);
  };
  
  userData = userData[0];
  
  for (let user of userData.users) {
    leaderboardArray.push({
      ActorId: user.ActorId,
      Name: user.Name,
      Level: buildLevel(user.Fame),
      Money: user.Money,
      Fame: user.Fame,
      Fortune: user.Fortune,
      FriendCount: 0,
      IsExtra: user.IsExtra,
      RoomLikes: user.RoomLikes
    });
  };
  
  return buildXML("GetHighscore", {
    totalRecords: userData.totalCount,
    pageindex: request.pageindex,
    pagesize: 7,
    items: {
      ActorHighscore: leaderboardArray
    }
  })
}