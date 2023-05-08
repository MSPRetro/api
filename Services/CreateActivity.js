const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "CreateActivity",
  needTicket: true,
  levelModerator: 0
};

exports.run = () => {  
  return buildXML("CreateActivity");
};
