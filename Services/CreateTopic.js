const { topicModel, postModel } = require("../Utils/Schemas.js");
const { getNewId } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "CreateTopic",
	needTicket: true,
	levelModerator: 0
};

exports.run = async (request, ActorId) => {
	let TopicId = (await getNewId("topic_id")) + 1;

	const topic = new topicModel({
		TopicId: TopicId,
		ForumId: request.forumId,
		Subject: request.subject,
		ActorId: ActorId,
		PostDate: new Date(),
		IsDeleted: 0
	});
	await topic.save();

	let PostId = (await getNewId("post_id")) + 1;

	const post = new postModel({
		PostId: PostId,
		TopicId: TopicId,
		ForumId: request.ForumId,
		ActorId: ActorId,
		Message: request.message,
		PostDate: new Date(),
		IsDeleted: 0
	});
	await post.save();

	return buildXML("CreateTopic");
};
