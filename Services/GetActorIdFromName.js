const { userModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "GetActorIdFromName",
  needTicket: false,
  levelModerator: 0
};

exports.run = async request => {
  const user = await userModel.findOne({ Name: request.actorName });
  if (!user) return buildXML("GetActorIdFromName", 0);
  
  return buildXML("GetActorIdFromName", user.ActorId);
};