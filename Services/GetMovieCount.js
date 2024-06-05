const { movieModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "GetMovieCount",
  needTicket: false,
  levelModerator: 0
};

exports.run = async () => {
  return buildXML("GetMovieCount", await movieModel.countDocuments({ State: 100 }));
};