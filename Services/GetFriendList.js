const { friendModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetFriendList",
  needTicket: true,
  levelModerator: 0
};

exports.run = async request => {
  const friends = await friendModel.aggregate([
    {
      $match: {
        $or: [
          { RequesterId: request.userId, Status: 1 },
          { ReceiverId: request.userId, Status: 1 }
        ]
      }
    },
    {
      $project: {
        _id: 0,
        int: {
          $cond: [
            { $eq: ["$RequesterId", request.userId] },
            "$ReceiverId",
            "$RequesterId"
          ]
        }
      }
    }
  ]);
  
  return buildXML("GetFriendList", friends);
};