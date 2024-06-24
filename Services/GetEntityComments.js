const { commentEntityModel, userModel } = require("../Utils/Schemas.js");
const { formatDate } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "GetEntityComments",
	needTicket: true,
	levelModerator: 0
};

exports.run = async request => {
	let commentsArray = [];
	let json;

	switch (request.EntityType) {
		case "look":
			json = { EntityType: 1, EntityId: request.entityId, IsDeleted: 0 };

			const commentsLook = await commentEntityModel
				.find(json)
				.sort({ _id: -1 })
				.skip(request.pageindex * 3)
				.limit(3);

			for (let comment of commentsLook) {
				const user = await userModel.findOne({
					ActorId: comment.ActorId
				});

				commentsArray.push({
					EntityCommentId: comment.EntityCommentId,
					EntityType: comment.EntityId,
					EntityId: comment.EntityId,
					ActorId: comment.ActorId,
					Created: formatDate(comment.Created),
					Comment: comment.Comment,
					IsDeleted: comment.IsDeleted,
					ActorEntityCommentList: {
						ActorId: user.ActorId,
						Name: user.Name
					}
				});
			}

			break;
		case "moviecompetition":
			json = { EntityType: 5, EntityId: request.entityId, IsDeleted: 0 };

			const commentsCompetition = await commentEntityModel
				.find(json)
				.sort({ _id: -1 })
				.skip(request.pageindex * 3)
				.limit(3);

			for (let comment of commentsCompetition) {
				const user = await userModel.findOne({
					ActorId: comment.ActorId
				});

				commentsArray.push({
					EntityCommentId: comment.EntityCommentId,
					EntityType: comment.EntityId,
					EntityId: comment.EntityId,
					ActorId: comment.ActorId,
					Created: formatDate(comment.Created),
					Comment: comment.Comment,
					IsDeleted: comment.IsDeleted,
					ActorEntityCommentList: {
						ActorId: user.ActorId,
						Name: user.Name
					}
				});
			}

			break;
		default:
			return console.log(
				`[GetEntityComments] : ${request.EntityType} in not coded.`
			);
	}

	return buildXML("GetEntityComments", {
		totalRecords: await commentEntityModel.countDocuments(json),
		pageindex: request.pageindex,
		pagesize: 3,
		items: {
			EntityCommentList: commentsArray
		}
	});
};
