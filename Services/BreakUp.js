const { boyfriendModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "BreakUp",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  await boyfriendModel.updateOne({ ReceiverId: ActorId, RequesterId: request.boyfriendId }, { Status: 0 });
  await boyfriendModel.updateOne({ RequesterId: ActorId, ReceiverId: request.boyfriendId }, { Status: 0 });
  
  return buildXML("BreakUp");
}