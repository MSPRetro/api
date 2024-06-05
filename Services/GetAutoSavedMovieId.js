const globals = require("../Utils/Globals.js");
const { buildXML } = require("../Utils/XML.js");

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
