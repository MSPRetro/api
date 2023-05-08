const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetActorMovieCount",
  needTicket: false,
  levelModerator: 0
};

exports.run = () => {
  return buildXML("GetActorMovieCount", 5);
};