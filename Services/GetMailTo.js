const { mailModel, userModel } = require("../Utils/Schemas.js");
const { formatDate } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "GetMailTo",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  const mails = await mailModel.find({ ToActorId: ActorId, Status: 1 })
  .sort({ _id: -1 })
  .skip(request.pageindex * 10)
  .limit(10);
  
  let mailsData = [ ];
  
  for(let mail of mails) {
    const ActorFrom = await userModel.findOne({ ActorId: mail.FromActorId });
    const ActorTo = await userModel.findOne({ ActorId: ActorId });
    
    mailsData.push({
      MailId: mail.MailId,
      FromActorId: mail.FromActorId,
      ToActorId: mail.ToActorId,
      Subject: mail.Subject,
      Message: mail.Message,
      wDate: formatDate(mail.wDate),
      Status: 1,
      Actor: {
        ActorId: ActorFrom.ActorId,
        Name: ActorFrom.Name
      },
      ActorTo: {
        ActorId: ActorTo.ActorId,
        Name: ActorTo.Name
      }
    });
  };
  
  await userModel.updateOne({ ActorId: ActorId }, { $set: { "Extra.HasUnreadMessages": 0 } });
  
  return buildXML("GetMailTo", {
    totalRecords: await mailModel.countDocuments({ ToActorId: ActorId, Status: 1 }),
    pageindex: request.pageindex,
    pagesize: 10,
    items: {
      Mail: mailsData
    }
  });
};
