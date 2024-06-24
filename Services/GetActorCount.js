const { userModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "GetActorCount",
	needTicket: false,
	levelModerator: 0
};

exports.run = async () => {
	return buildXML(
		"GetActorCount",
		await userModel.countDocuments({ "Extra.IsExtra": 0 })
	);
};
