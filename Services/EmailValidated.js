const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "EmailValidated",
  needTicket: false,
  levelModerator: 0
};

exports.run = request => {
  return buildXML("EmailValidated", request.actorId);
};

// actorId => confirmation message
// 0 => you have already take your starcoins