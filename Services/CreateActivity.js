const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "CreateActivity",
	needTicket: true,
	levelModerator: 0
};

exports.run = () => {
	return buildXML("CreateActivity");
};
