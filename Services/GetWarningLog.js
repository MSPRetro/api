const { logModel, behaviorModel } = require("../Utils/Schemas.js");
const { buildXML, formatDate } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetWarningLog",
  needTicket: true,
  levelModerator: 2
};

exports.run = async request => {  
  const behaviors = await behaviorModel.find({ })
  .sort({ _id: -1 })
  .skip(request.pageindex * 10)
  .limit(10);

  let behaviorData = [ ];

  for (let behavior of behaviors) {
    const log = await logModel.findOne({ LogId: behavior.ChatlogId });
    if (!log) continue;

    behaviorData.push({
      ChatLogId: log.LogId,
      RoomId: log.RoomId,
      ActorId: log.ActorId,
      Message: log.Message,
      _Date: formatDate(log.Date),
      IpAsInt: log.IPId,
      DaysLocked: behavior.LockedDays,
      DateHandled: formatDate(behavior.HandledOn),
      HandledByActorId: behavior.HandledByActorId
    });
  };

  return buildXML("GetWarningLog", {
    totalRecords: await behaviorModel.countDocuments({ }),
    pageindex: request.pageindex,
    pagesize: 10,
    items: {
     ChatLog: behaviorData 
    }
  });
};
