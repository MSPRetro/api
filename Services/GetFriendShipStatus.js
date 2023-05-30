const { friendModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetFriendShipStatus",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  if (request.otherUserId == ActorId) return buildXML("GetFriendShipStatus", 0);

  const friendship = await friendModel.findOne({
    $or: [
      { RequesterId: ActorId, ReceiverId: request.otherUserId },
      { ReceiverId: ActorId, RequesterId: request.otherUserId }
    ]
  });

  let status;

  if (!friendship) {
    return buildXML("GetFriendShipStatus", 1);
  } else {
    switch (friendship.Status) {
      case 0:
        status = 1;
        break;
      case 1:
        status = 2;
        break;
      case 2:
        status = friendship.RequesterId == ActorId ? 3 : 4;
        break;
    }
  }

  return buildXML("GetFriendShipStatus", status);
};