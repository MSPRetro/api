const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "fileExists",
  needTicket: false,
  levelModerator: 0
};

exports.run = () => {
  return buildXML("fileExists", false);
};