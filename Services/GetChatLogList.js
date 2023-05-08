const { logModel, userModel } = require("../Utils/Schemas.js");
const { buildXML, formatDate } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetChatLogList",
  needTicket: true,
  levelModerator: 1
};

exports.run = async request => {
  const logs = await logModel.find({ ActorId: request.actorId })
  .sort({ _id: -1 })
  .skip(request.pageindex * 13)
  .limit(13);
  
  const user = await userModel.findOne({ ActorId: request.actorId });
  if (!user) return;

  let logsData = [ ];

  for (let log of logs) {
    logsData.push({
      ChatLogId: log.LogId,
      RoomId: log.RoomId,
      ActorId: log.ActorId,
      Message: log.Message,
      _Date: formatDate(log.Date),
      IpAsInt: log.IPId,
      DaysLocked: 0,
      DateHandled: formatDate(new Date(0)),
      HandledByActorId: 1
    });
  };

  return buildXML("GetChatLogList", {
    totalRecords: await logModel.countDocuments({ ActorId: request.actorId }),
    pageindex: request.pageindex,
    pagesize: 13,
    items: {
      ChatLog: logsData
    }
  });
};
