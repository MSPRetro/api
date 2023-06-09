const { friendModel, lookModel } = require("../Utils/Schemas.js");
const { buildXML, formatDate } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetHighscoreLook",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => { 
  let lookData;
  
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
          from: "looks", 
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
          as: "looks"
        }
      },
      {
        $unwind: "$looks"
      },
      {
        $replaceRoot: {
          newRoot: "$looks"
        }
      },
      {
        $unionWith: {
          coll: "looks", 
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
          ActorId: { $ne: 1 },
          State: 0
        }
      },
      {
        $project: {
          _id: 0,
          LookId: "$LookId",
          ActorId: "$ActorId",
          Created: "$Created", 
          Headline: "$Headline", 
          LookData: "$LookData", 
          Likes: {
            $size: "$Likes"
          },
          Sells: {
            $size: "$Sells"
          }
        }
      },
      { $sort: { Likes: -1 } },
      {
        $facet: {
          totalCount: [{ $count: "count" }],
          looks: [
            { $skip: request.pageindex * 5 },
            { $limit: 5 },
            {
              $lookup: {
                from: "users",
                localField: "ActorId",
                foreignField: "ActorId",
                as: "user"
              }
            },
            {
              $unwind: "$user"
            },
            {
              $project: {
                LookId: 1,
                ActorId: 1,
                Created: 1, 
                Headline: 1, 
                LookData: 1, 
                Likes: 1,
                Sells: 1,
                ActorName: "$user.Name"
              }
            }
          ]
        }
      },
      {
        $project: {
          looks: 1, 
          totalCount: {
            $arrayElemAt: [ "$totalCount.count", 0 ]
          }
        }
      }
    ];
    
    let sortStage = pipeline.find(stage => stage.hasOwnProperty("$sort"));
    if (request.orderBy === "SELLS") sortStage.$sort = { Sells: -1 };
    
    lookData = await friendModel.aggregate(pipeline);
  } else {
    const pipeline = [
      {
        $match: {
          ActorId: { $ne: 1 },
          State: 0
        }
      },
      {
        $project: {
          _id: 0,
          LookId: "$LookId",
          ActorId: "$ActorId",
          Created: "$Created",
          Headline: "$Headline",
          LookData: "$LookData",
          Likes: {
            $size: "$Likes",
          },
          Sells: {
            $size: "$Sells",
          }
        }
      },
      { $sort: { Likes: -1 } },
      {
        $facet: {
          totalCount: [{ $count: "count" }],
          looks: [
            { $skip: request.pageindex * 5 },
            { $limit: 5 },
            {
              $lookup: {
                from: "users",
                localField: "ActorId",
                foreignField: "ActorId",
                as: "user"
              }
            },
            {
              $unwind: "$user"
            },
            {
              $project: {
                LookId: 1,
                ActorId: 1,
                Created: 1,
                Headline: 1,
                LookData: 1,
                Likes: 1,
                Sells: 1,
                ActorName: "$user.Name"
              }
            }
          ]
        }
      },
      {
        $project: {
          looks: 1,
          totalCount: {
            $arrayElemAt: ["$totalCount.count", 0]
          }
        }
      }
    ];
    
    let sortStage = pipeline.find(stage => stage.hasOwnProperty("$sort"));
    if (request.orderBy === "SELLS") sortStage.$sort = { Sells: -1 };
    
    lookData = await lookModel.aggregate(pipeline);
  }
  
  lookData = lookData[0];
  
  let lookArray = [ ]; 

  for (let look of lookData.looks) {
    lookArray.push({
      LookId: look.LookId,
      ActorId: look.ActorId,
      Created: formatDate(look.Created),
      Headline: look.Headline,
      LookData: look.LookData,
      Likes: look.Likes,
      Sells: look.Sells,
      ActorName: look.ActorName
    });
  };
  
  return buildXML("GetHighscoreLook", {
    totalRecords: lookData.totalCount,
    pageindex: request.pageindex,
    pagesize: 5,
    items: {
      HighscoreLook: lookArray
    }
  });
}