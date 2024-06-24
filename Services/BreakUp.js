const { boyfriendModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "BreakUp",
	needTicket: true,
	levelModerator: 0
};

exports.run = async (request, ActorId) => {
	await boyfriendModel.updateMany(
		{
			$or: [
				{ ReceiverId: ActorId, RequesterId: request.boyfriendId },
				{ RequesterId: ActorId, ReceiverId: request.boyfriendId }
			]
		},
		{ $set: { Status: 0 } }
	);

	return buildXML("BreakUp");
};
