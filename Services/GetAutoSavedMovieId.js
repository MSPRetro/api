const { buildXML } = require("../Utils/Util.js");
const globals = require("../Utils/Globals.js");

exports.data = {
  SOAPAction: "GetAutoSavedMovieId",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  // if (!globals.getValue(`${ActorId}-TICKETCHANGE`)) {
  //   globals.setValue(`${ActorId}-TICKETCHANGE`, true);
  // };
  
  return buildXML("GetAutoSavedMovieId", 0);
};
