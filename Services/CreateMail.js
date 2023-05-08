const { mailModel, userModel } = require("../Utils/Schemas.js");
const { buildXML, getNewId } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "CreateMail",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  if (!await userModel.findOne({ ActorId: request.mail.ToActorId })) return;
  if (isNaN(request.mail.Subject && typeof request.mail.Subject !== "string")) request.mail.Subject = "[System]: No subject";
  if (isNaN(request.mail.Message && typeof request.mail.Message !== "string")) request.mail.Subject = "[System]: No message";
  
  let MailId = await getNewId("mail_id") + 1;
  
  const mail = new mailModel({
    MailId: MailId,
    FromActorId: ActorId,
    ToActorId: request.mail.ToActorId,
    Subject: request.mail.Subject,
    Message: request.mail.Message,
    wDate: new Date(),
    Status: 1
  });
  await mail.save();
  
  await userModel.updateOne({ ActorId: request.mail.ToActorId }, { $set: { "Extra.HasUnreadMessages": 1 } });
  
  return buildXML("CreateMail");
};