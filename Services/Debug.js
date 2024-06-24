const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "Debug",
	needTicket: false,
	levelModerator: 0
};

exports.run = () => {
	return buildXML("Debug");
};
