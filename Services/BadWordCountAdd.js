const { userModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "BadWordCountAdd",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  const user = await userModel.findOne({ ActorId: ActorId });
  
  await userModel.updateOne({ ActorId: ActorId }, { $set: {
    "Extra.BadWordCount": user.Extra.BadWordCount + 1
  }});
  
  return buildXML("BadWordCountAdd");
};