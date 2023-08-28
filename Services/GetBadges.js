const { buildXML, friendVIPCount } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetBadges",
  needTicket: true,
  levelModerator: 0
};

exports.run = async request => {  
  return buildXML("GetBadges", {
    friendCountVip: await friendVIPCount(request.actorId),
    friendCountInvitedMinLevel3: 0
  });
};