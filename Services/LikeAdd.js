const { userModel, lookModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "LikeAdd",
	needTicket: true,
	levelModerator: 0
};

exports.run = async (request, ActorId) => {
	switch (request.EntityType) {
		case "room":
			const user = await userModel.findOne({ ActorId: request.EntityId });
			if (!user || user.Room.RoomActorLikes.includes(ActorId))
				return buildXML("LikeAdd", false);

			await userModel.updateOne(
				{ ActorId: request.EntityId },
				{
					$push: {
						"Room.RoomActorLikes": ActorId
					}
				}
			);
			break;
		case "look":
			const look = await lookModel.findOne({ LookId: request.EntityId });
			if (!look || look.Likes.includes(ActorId))
				return buildXML("LikeAdd", false);

			await lookModel.updateOne(
				{ LookId: request.EntityId },
				{
					$push: {
						Likes: ActorId
					}
				}
			);
	}

	return buildXML("LikeAdd", true);
};
