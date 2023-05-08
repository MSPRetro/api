const { buildXML, getActorDetails } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "LoadActorDetails",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  // await userModel.updateOne({ ActorId: request.actorId }, { $set: { "Moderation.BehaviourStatus": 0 } });
  return buildXML("LoadActorDetails", await getActorDetails(request.actorId, ActorId));
};
