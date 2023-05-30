const { friendModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetFriendListWithName",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  const friends = await friendModel.aggregate([
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
          requester: "$RequesterId",
          receiver: "$ReceiverId"
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ["$$requester", "$ActorId"] },
                  { $eq: ["$$receiver", "$ActorId"] }
                ]
              }
            }
          },
          {
            $project: {
              _id: 0,
              actorId: "$ActorId",
              name: "$Name"
            }
          }
        ],
        as: "user"
      }
    },
    {
      $unwind: "$user"
    },
    {
      $group: {
        _id: "$user.actorId",
        actorId: { $first: "$user.actorId" },
        name: { $first: "$user.name" }
      }
    },
    {
      $match: {
        actorId: { $ne: ActorId }
      }
    },
    {
      $project: {
        _id: 0,
        actorId: 1,
        name: 1
      }
    }
  ]);
  
  return buildXML("GetFriendListWithName", {
    FriendData: friends 
  });
};