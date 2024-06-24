const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "IsAdminSite",
	needTicket: true,
	levelModerator: 1
};

exports.run = () => {
	return buildXML("IsAdminSite", true);
};
