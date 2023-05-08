const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetBadges",
  needTicket: true,
  levelModerator: 0
};

exports.run = request => {
  // var actorId = request.actorId;
  // console.log(actorId);
  
  return buildXML("GetBadges", {
    friendCountVip: 0,
    friendCountInvitedMinLevel3: 0
  });
};
