const { commentEntityModel, lookModel } = require("../Utils/Schemas.js");
const { isModerator } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "EntityCommentDelete",
	needTicket: true,
	levelModerator: 0
};

exports.run = async (request, ActorId) => {
	const comment = await commentEntityModel.findOne({
		EntityCommentId: request.entityCommentId
	});
	if (!comment) return;

	if (comment.EntityType == 1) {
		const look = await lookModel.findOne({ LookId: comment.EntityId });
		if (!look) return;

		if (
			comment.ActorId !== ActorId &&
			look.ActorId !== ActorId &&
			!(await isModerator(ActorId, false, 1))
		)
			return;
	} else if (comment.EntityType == 5) {
		if (comment.ActorId != ActorId && !(await isModerator(ActorId, false, 1)))
			return;
	}

	await commentEntityModel.updateOne(
		{ EntityCommentId: request.entityCommentId },
		{
			IsDeleted: 1
		}
	);

	return buildXML("EntityCommentDelete");
};
