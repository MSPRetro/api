const { mailModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "DeleteMail",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  await mailModel.updateOne({ MailId: request.mailId, ToActorId: ActorId }, { Status: 0 });
  
  return buildXML("DeleteMail");
};