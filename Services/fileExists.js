const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "fileExists",
	needTicket: false,
	levelModerator: 0
};

exports.run = () => {
	return buildXML("fileExists", false);
};
