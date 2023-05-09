const { userModel } = require("../Utils/Schemas.js");
const { buildXML, getActorDetails } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "LoadActorDetails2",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId, IP, Password) => {
  if (request.updateProfileDisplayCount) {
    const user = await userModel.findOne({ ActorId: request.actorId });
    if (!user) return;
    
    if (!user.Profile.ProfileDisplays.includes(ActorId)) await userModel.updateOne({ ActorId: user.ActorId }, { $push: { "Profile.ProfileDisplays": ActorId } })
  };
  
  return buildXML("LoadActorDetails2", await getActorDetails(request.actorId, ActorId, Password));
};