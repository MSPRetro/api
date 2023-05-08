const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "Debug",
  needTicket: false,
  levelModerator: 0
};

exports.run = () => {  
  return buildXML("Debug");
};