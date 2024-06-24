const { userModel } = require("../Utils/Schemas.js");
const { isVip, addMinutes, buildLevel, addFame } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "GiveAutograph",
	needTicket: true,
	levelModerator: 0
};

exports.run = async (request, ActorId) => {
	if (request.receiverActorId == ActorId) return;

	const receiverActorId = await userModel.findOne({
		ActorId: request.receiverActorId
	});
	const user = await userModel.findOne({ ActorId: ActorId });

	let timeBeforeNewAuto;

	if (await isVip(ActorId, user)) timeBeforeNewAuto = 15;
	else timeBeforeNewAuto = 60;

	if (
		!receiverActorId ||
		new Date(
			addMinutes(
				new Date(user.Autographs.TimeOfLastAutographGiven),
				timeBeforeNewAuto
			)
		).getTime() > Date.now()
	)
		return;

	await userModel.updateOne(
		{ ActorId: ActorId },
		{
			$set: {
				"Autographs.NumberOfAutographsGiven":
					user.Autographs.NumberOfAutographsGiven + 1,
				"Autographs.TimeOfLastAutographGiven": new Date()
			}
		}
	);

	await addFame(ActorId, user, 50, true);

	await userModel.updateOne(
		{ ActorId: receiverActorId.ActorId },
		{
			$set: {
				"Autographs.NumberOfAutographsReceived":
					receiverActorId.Autographs.NumberOfAutographsReceived + 1
			}
		}
	);

	await addFame(
		request.receiverActorId,
		receiverActorId,
		180 + buildLevel(user.Progression.Fame),
		true
	);

	return buildXML("GiveAutograph");
};
