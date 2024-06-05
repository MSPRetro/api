const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "CreateMissingTodos",
  needTicket: true,
  levelModerator: 0
};

exports.run = () => {
  return buildXML("CreateMissingTodos", false);
};