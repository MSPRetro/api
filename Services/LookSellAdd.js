const { lookModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "LookSellAdd",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  const look = await lookModel.findOne({ LookId: request.LookId, State: 0 });
  if (!look || look.Sells.includes(ActorId)) return buildXML("LookSellAdd", false);
  
  await lookModel.updateOne({ LookId: request.LookId }, { $push: { Sells: ActorId } });
  return buildXML("LookSellAdd", true);
}