const { friendModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetFriendShipStatus",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  if (request.otherUserId == ActorId) return buildXML("GetFriendShipStatus", 0);
  
  const friend1 = await friendModel.findOne({ RequesterId: ActorId, ReceiverId: request.otherUserId });
  const friend2 = await friendModel.findOne({ ReceiverId: ActorId, RequesterId: request.otherUserId });
  
  let status;
  
  if (!friend1 && !friend2) {
    return buildXML("GetFriendShipStatus", 1);
  } else if (friend1 && !friend2) {
    switch (friend1.Status) {
      case 0:
        status = 1;
        break;
      case 1:
        status = 2;
        break;
      case 2:
        status = 3;
        break;
    };
  } else if (!friend1 && friend2) {    
    switch (friend2.Status) {
      case 0:
        status = 1;
        break;
      case 1:
        status = 2;
        break;
      case 2:
        status = 4;
        break;
    };
  };
  
  return buildXML("GetFriendShipStatus", status);
};
