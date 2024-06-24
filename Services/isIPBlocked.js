const { IPModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "isIPBlocked",
	needTicket: true,
	levelModerator: 2
};

exports.run = async request => {
	const IP = await IPModel.findOne({ IPId: request.ipAsIntToUse });
	if (!IP) return buildXML("isIPBlocked", false);

	let blocked = false;
	if (IP.Locked) blocked = true;

	return buildXML("isIPBlocked", blocked);
};
