const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "UpdateRetention",
  needTicket: true,
  levelModerator: 0
};

exports.run = () => {
  // used to give $500 free StarCoins
  
  return buildXML("UpdateRetention", "");
};