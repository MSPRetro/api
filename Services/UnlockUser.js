const { behaviorModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "UnlockUser",
	needTicket: true,
	levelModerator: 1
};

exports.run = async request => {
	const behavior = await behaviorModel
		.findOne({ ActorId: request.actorId, BehaviourStatus: 1 })
		.sort({ _id: -1 });
	if (!behavior) return;

	await behaviorModel.updateOne(
		{ BehaviorId: behavior.BehaviorId },
		{ BehaviourStatus: 0 }
	);

	return buildXML("UnlockUser", 1);
};
