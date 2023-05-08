const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "CreateTestException",
  needTicket: false,
  levelModerator: 0
};

exports.run = () => {  
  return buildXML("CreateTestException");
}