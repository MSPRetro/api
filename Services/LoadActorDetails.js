const { getActorDetails } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "LoadActorDetails",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId, IP, Password) => {
  // await userModel.updateOne({ ActorId: request.actorId }, { $set: { "Moderation.BehaviourStatus": 0 } });
  return buildXML("LoadActorDetails", await getActorDetails(request.actorId, ActorId, Password));
};
