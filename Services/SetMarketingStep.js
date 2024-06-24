const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "SetMarketingStep",
	needTicket: true,
	levelModerator: 0
};

exports.run = () => {
	return buildXML("SetMarketingStep");
};
