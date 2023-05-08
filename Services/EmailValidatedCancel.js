const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "EmailValidatedCancel",
  needTicket: false,
  levelModerator: 0
};

exports.run = () => {
  return buildXML("EmailValidatedCancel");
};
