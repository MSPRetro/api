const { lookModel, activityModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "LookDelete",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  await lookModel.updateOne({ LookId: request.LookId, ActorId: ActorId }, { State: 1 });
  await activityModel.updateOne({ Friend: ActorId, LookId: request.LookId }, { ActorId: 0, FriendId: 0 });
  
  return buildXML("LookDelete", false);
};