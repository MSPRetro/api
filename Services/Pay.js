const { userModel } = require("../Utils/Schemas.js");
const { buildXML, addOrRemoveMoney, addFame, getActorDetails } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "Pay",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId, IP, Password) => {
  if (Math.sign(request.starcoins) != 1) return;
  
  await addOrRemoveMoney(ActorId, request.starcoins);
  await addFame(ActorId, false, request.starcoins / 10);
    
  return buildXML("Pay", await getActorDetails(ActorId, ActorId, Password));
}