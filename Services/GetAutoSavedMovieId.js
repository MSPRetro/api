const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "GetAutoSavedMovieId",
	needTicket: true,
	levelModerator: 0
};

exports.run = () => {
	return buildXML("GetAutoSavedMovieId", 0);
};
