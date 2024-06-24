const {
	lookModel,
	competitionModel,
	commentEntityModel
} = require("../Utils/Schemas.js");
const { getNewId } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "CommentEntity",
	needTicket: true,
	levelModerator: 0
};

exports.run = async (request, ActorId) => {
	switch (request.entityComment.EntityType) {
		case 1:
			const look = await lookModel.findOne({
				LookId: request.entityComment.EntityId,
				State: 0
			});
			if (!look) return;

			let EntityCommentIdLook = (await getNewId("comment_entity_id")) + 1;

			const commentLook = new commentEntityModel({
				EntityCommentId: EntityCommentIdLook,
				EntityType: 1,
				EntityId: request.entityComment.EntityId,
				ActorId: ActorId,
				Created: new Date(),
				Comment: request.entityComment.Comment.toString(),
				IsDeleted: 0
			});
			await commentLook.save();

			break;
		case 5:
			const competition = await competitionModel.findOne({
				MovieCompetitionId: request.entityComment.EntityId
			});
			if (!competition) return;

			let EntityCommentIdCompetition =
				(await getNewId("comment_entity_id")) + 1;

			const commentCompetition = new commentEntityModel({
				EntityCommentId: EntityCommentIdCompetition,
				EntityType: 5,
				EntityId: request.entityComment.EntityId,
				ActorId: ActorId,
				Created: new Date(),
				Comment: request.entityComment.Comment.toString(),
				IsDeleted: 0
			});
			await commentCompetition.save();

			break;
		default:
			return console.log(
				`[CommentEntity] : ${request.entityComment.EntityType} in not coded.`
			);
	}

	return buildXML("CommentEntity");
};
