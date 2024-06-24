const { createFMSNotification } = require("./LogChat.js");
const { userModel, ticketModel } = require("../Utils/Schemas.js");
const { isModerator } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");
const { deleteValue } = require("../Utils/Globals.js");

exports.data = {
	SOAPAction: "DeleteUser2",
	needTicket: true,
	levelModerator: 0
};

exports.run = async (request, ActorId) => {
	let user;

	if (request.userIdTobeDeleted == ActorId) {
		user = await userModel.findOne({
			ActorId: ActorId,
			"Extra.IsExtra": 0
		});

		await userModel.updateOne(
			{ ActorId: ActorId },
			{
				$set: {
					Name: "Deleted User",
					LastName: user.Name,
					"Extra.IsExtra": 1
				}
			}
		);
	} else {
		user = await userModel.findOne({
			ActorId: request.userIdTobeDeleted,
			"Extra.IsExtra": 0
		});
		if (
			!user ||
			user.ActorId == 1 ||
			(await isModerator(user.ActorId, user, 1)) ||
			!(await isModerator(ActorId, false, 2))
		)
			return buildXML("DeleteUser2", 0);

		await userModel.updateOne(
			{ ActorId: user.ActorId },
			{
				$set: {
					Name: "Deleted User",
					LastName: user.Name,
					"Extra.IsExtra": 1
				}
			}
		);

		createFMSNotification("logout|" + ActorId + "|" + user.ActorId);
	}

	deleteValue(`${user.ActorId}-PASSWORD`);
	await ticketModel.updateMany(
		{ ActorId: user.ActorId, Disable: false },
		{ Disable: true }
	);

	return buildXML("DeleteUser2", 1);
};
