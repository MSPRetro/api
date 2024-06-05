const { boyfriendModel, todoModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "AcceptBoyfriend",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  if (request.boyfriendToAcceptId == ActorId) return;
  
  await boyfriendModel.updateOne({ ReceiverId: ActorId, RequesterId: request.boyfriendToAcceptId }, {
    Status: 2
  });
  
  await todoModel.updateMany({ ActorId: request.boyfriendToAcceptId, FriendId: ActorId, Type: 5 }, { ActorId: 0, FriendId: 0 });
  
  return buildXML("AcceptBoyfriend");
};