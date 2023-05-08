const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "IsDevSite",
  needTicket: true,
  levelModerator: 1
};

exports.run = request => {
  return buildXML("IsDevSite", true);
};