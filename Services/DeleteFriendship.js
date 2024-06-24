const {
	friendModel,
	activityModel,
	todoModel
} = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "DeleteFriendship",
	needTicket: true,
	levelModerator: 0
};

exports.run = async (request, ActorId) => {
	if (request.friendId != 1) {
		await friendModel.updateOne(
			{ ReceiverId: ActorId, RequesterId: request.friendId },
			{ Status: 0 }
		);
		await friendModel.updateOne(
			{ RequesterId: ActorId, ReceiverId: request.friendId },
			{ Status: 0 }
		);

		await activityModel.updateMany(
			{ ActorId: request.friendId, Friend: ActorId, Type: 2 },
			{ ActorId: 0, FriendId: 0 }
		);
		await todoModel.updateMany(
			{ ActorId: request.friendId, FriendId: ActorId, Type: 3 },
			{ ActorId: 0, FriendId: 0 }
		);
	}

	const friends1 = await friendModel.find({
		RequesterId: request.userId,
		Status: 1
	});
	const friends2 = await friendModel.find({
		ReceiverId: request.userId,
		Status: 1
	});

	let FriendData = [];
	for (let friend of friends1) {
		FriendData.push({ int: friend.ReceiverId });
	}
	for (let friend of friends2) {
		FriendData.push({ int: friend.RequesterId });
	}

	return buildXML("DeleteFriendship", FriendData);
};
