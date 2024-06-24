const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "ClientLog",
	needTicket: false,
	levelModerator: 0
};

exports.run = async () => {
	// console.log(`[ClientLog]: \nType: ${request.logType}\nMessage: ${request.msg}`);

	return buildXML("ClientLog");
};
