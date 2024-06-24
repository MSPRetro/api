const { topicModel, postModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "updateTopic",
	needTicket: true,
	levelModerator: 1
};

exports.run = async request => {
	await topicModel.updateOne(
		{ TopicId: request.topic.TopicId },
		{ IsDeleted: 1 }
	);
	await postModel.updateMany(
		{ TopicId: request.topic.TopicId },
		{ IsDeleted: 1 }
	);

	return buildXML("updateTopic");
};
