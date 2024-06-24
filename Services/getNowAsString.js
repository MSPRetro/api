const { formatDate } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "getNowAsString",
	needTicket: false,
	levelModerator: 0
};

exports.run = request => {
	//return buildXML("getNowAsString", "2021-12-29T14:39:08");
	return buildXML("getNowAsString", formatDate(new Date(), true));
};
