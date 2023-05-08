const { mailModel, userModel } = require("../Utils/Schemas.js");
const { buildXML, formatDate } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetMailFrom",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  const mails = await mailModel.find({ FromActorId: ActorId })
  .sort({ _id: -1 })
  .skip(request.pageindex * 10)
  .limit(10);
  
  let mailsData = [ ];
  
  for(let mail of mails) {
    const ActorFrom = await userModel.findOne({ ActorId: ActorId });
    const ActorTo = await userModel.findOne({ ActorId: mail.ToActorId });
    
    mailsData.push({
      MailId: mail.MailId,
      FromActorId: mail.ToActorId,
      ToActorId: mail.FromActorId,
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
  
  return buildXML("GetMailFrom", {
    totalRecords: await mailModel.countDocuments({ FromActorId: ActorId }),
    pageindex: request.pageindex,
    pagesize: 10,
    items: {
      Mail: mailsData
    }
  });
};
