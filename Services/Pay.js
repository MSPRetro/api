const { userModel } = require("../Utils/Schemas.js");
const { buildXML, addFame, getActorDetails } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "Pay",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId, IP, Password) => {
  if (Math.sign(request.starcoins) != 1) return;
  
  const user = await userModel.findOne({ ActorId: ActorId });
  
  await userModel.updateOne({ ActorId: ActorId }, { $set: {
    "Progression.Money": user.Progression.Money - request.starcoins
  }});
  
  await addFame(ActorId, user, request.starcoins / 10);
    
  return buildXML("Pay", await getActorDetails(ActorId, ActorId, Password));
}