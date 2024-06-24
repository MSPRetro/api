const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "awardActorFame",
	needTicket: true,
	levelModerator: 0
};

exports.run = () => {
	return buildXML("awardActorFame");
};
