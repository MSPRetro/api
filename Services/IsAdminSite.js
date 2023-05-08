const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "IsAdminSite",
  needTicket: true,
  levelModerator: 1
};

exports.run = request => {
  return buildXML("IsAdminSite", true);
};