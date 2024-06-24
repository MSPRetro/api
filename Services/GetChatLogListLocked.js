const { logModel, behaviorModel } = require("../Utils/Schemas.js");
const { formatDate } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "GetChatLogListLocked",
	needTicket: true,
	levelModerator: 1
};

exports.run = async request => {
	const behaviors = await behaviorModel
		.find({ ActorId: request.actorId })
		.sort({ _id: -1 });

	let behaviorData = [];

	for (let behavior of behaviors) {
		const log = await logModel.findOne({ LogId: behavior.ChatlogId });
		if (!log) continue;

		behaviorData.push({
			ChatLogId: log.LogId,
			RoomId: log.RoomId,
			ActorId: log.ActorId,
			Message: log.Message,
			_Date: formatDate(log.Date),
			IpAsInt: log.IPId,
			DaysLocked: behavior.LockedDays,
			DateHandled: formatDate(behavior.HandledOn),
			HandledByActorId: behavior.HandledByActorId
		});
	}

	return buildXML("GetChatLogListLocked", {
		ChatLog: behaviorData
	});
};
