const { behaviorModel, logModel } = require("../Utils/Schemas.js");
const { buildXML, formatDate } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetIPWarnings",
  needTicket: true,
  levelModerator: 2
};

exports.run = async request => {  
  const warns = await behaviorModel.find({ IPId: request.ipAsIntToUse })
  .sort({ _id: -1 });
  
  let behaviorData = [ ];
  
  for (let warn of warns) {
    const log = await logModel.findOne({ IPId: warn.IPId });
    if (!log) continue;

    behaviorData.push({
      ChatLogId: log.LogId,
      RoomId: log.RoomId,
      ActorId: log.ActorId,
      Message: log.Message,
      _Date: formatDate(log.Date),
      IpAsInt: warn.IPId,
      DaysLocked: warn.LockedDays,
      DateHandled: formatDate(warn.HandledOn),
      HandledByActorId: warn.HandledByActorId
    });
  };
  
  return buildXML("GetIPWarnings", {
    ChatLog: behaviorData
  });
}