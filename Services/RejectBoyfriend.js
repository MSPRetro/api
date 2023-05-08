const { boyfriendModel, todoModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "RejectBoyfriend",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {    
  await boyfriendModel.updateOne({ ReceiverId: ActorId, RequesterId: request.boyfriendToRejectId }, {
    Status: 3
  });
  
  await todoModel.updateMany({ ActorId: request.boyfriendToRejectId, FriendId: ActorId, Type: 5 }, { ActorId: 0, FriendId: 0 });
  return buildXML("RejectBoyfriend");
}