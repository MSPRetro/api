const { userModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "BadWordCountClear",
  needTicket: true,
  levelModerator: 1
};

exports.run = async (request, ActorId) => {
  await userModel.updateOne({ ActorId: request.actorId }, { $set: {
    "Extra.BadWordCount": 0
  }});
  
  return buildXML("BadWordCountClear");
};