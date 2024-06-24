const { userModel } = require("../Utils/Schemas.js");
const { isModerator } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "RenameUser",
	needTicket: true,
	levelModerator: 3
};

exports.run = async request => {
	await userModel.updateOne(
		{ ActorId: request.actorId },
		{ Name: request.newUsername }
	);

	return buildXML("RenameUser", 1);
};
