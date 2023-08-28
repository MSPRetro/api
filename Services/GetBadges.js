const { friendModel, userModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetBadges",
  needTicket: true,
  levelModerator: 0
};

exports.run = async request => {
  let friends = await friendModel.aggregate([
    {
      $match: {
        $or: [
          { RequesterId: request.actorId, Status: 1 },
          { ReceiverId: request.actorId, Status: 1 }
        ]
      }
    },
    {
      $group: {
        _id: null,
        intArray: {
          $push: {
            $cond: [
              { $eq: ["$RequesterId", request.actorId] },
              "$ReceiverId",
              "$RequesterId"
            ]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        intArray: 1
      }
    }
  ]);
  
  friends = friends[0];
  if (!friends) return;
  
  return buildXML("GetBadges", {
    friendCountVip: await userModel.countDocuments({ ActorId: { $in: friends.intArray }, "VIP.MembershipTimeoutDate": { $gt: new Date() } }),
    friendCountInvitedMinLevel3: 0
  });
};