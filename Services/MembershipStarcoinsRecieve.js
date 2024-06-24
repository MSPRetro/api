const { userModel } = require("../Utils/Schemas.js");
const { addOrRemoveMoney } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "MembershipStarcoinsRecieve",
	needTicket: true,
	levelModerator: 3
};

exports.run = async (request, ActorId) => {
	if ([5, 10, 20, 40].includes(request.starCoins)) {
		// whell no vip

		await addOrRemoveMoney(ActorId, request.starCoins, true);
	} else if ([25, 50, 100, 200].includes(request.starCoins)) {
		// whell vip

		await addOrRemoveMoney(ActorId, request.starCoins, true);
	}

	await userModel.updateOne(
		{ ActorId: ActorId },
		{
			"VIP.MembershipGiftRecievedDate": new Date()
		}
	);

	return buildXML("MembershipStarcoinsRecieve");
};
