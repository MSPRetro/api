const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "SetMarketingStep",
  needTicket: true,
  levelModerator: 0
};

exports.run = request => {
  return buildXML("SetMarketingStep");
};