const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "CreateTestException",
  needTicket: false,
  levelModerator: 0
};

exports.run = () => {  
  return buildXML("CreateTestException");
}