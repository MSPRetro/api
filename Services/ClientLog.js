const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "ClientLog",
  needTicket: false,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  // console.log(`[ClientLog]: \nType: ${request.logType}\nMessage: ${request.msg}`);
  
  return buildXML("ClientLog");
}