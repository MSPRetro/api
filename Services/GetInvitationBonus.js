const { todoModel } = require("../Utils/Schemas.js");
const { addOrRemoveMoney } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "GetInvitationBonus",
	needTicket: true,
	levelModerator: 0
};

exports.run = async (request, ActorId) => {
	const todo = await todoModel.findOne({
		TodoId: request.todoId,
		Type: 4,
		FriendId: ActorId
	});
	if (!todo) return;

	await addOrRemoveMoney(ActorId, 300);

	await todoModel.updateMany(
		{ ActorId: todo.ActorId, FriendId: ActorId, Type: 4 },
		{ ActorId: 0, FriendId: 0 }
	);

	return buildXML("GetInvitationBonus");
};
