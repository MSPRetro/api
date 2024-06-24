const { friendModel, todoModel } = require("../Utils/Schemas.js");
const { createActivity } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "ApproveFriendship",
	needTicket: true,
	levelModerator: 0
};

exports.run = async (request, ActorId) => {
	if (request.friendId == ActorId) return;

	await friendModel.updateOne(
		{ RequesterId: request.friendId, ReceiverId: ActorId },
		{
			Status: 1
		}
	);

	await createActivity(ActorId, 2, 0, request.friendId, 0, 0);
	await todoModel.updateMany(
		{ ActorId: request.friendId, FriendId: ActorId, Type: 3 },
		{ ActorId: 0, FriendId: 0 }
	);

	return buildXML("ApproveFriendship", ""); // If the string is not empty, we can show the error that we want
};
