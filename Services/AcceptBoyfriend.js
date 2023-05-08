const { boyfriendModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "AcceptBoyfriend",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  if (request.boyfriendToAcceptId == ActorId) return;
  
  await boyfriendModel.updateOne({ RequesterId: request.boyfriendToAcceptId, ReceiverId: ActorId }, {
    Status: 1
  });
  
  return buildXML("AcceptBoyfriend");
};