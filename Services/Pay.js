const {
	addOrRemoveMoney,
	addFame,
	getActorDetails
} = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "Pay",
	needTicket: true,
	levelModerator: 0
};

exports.run = async (request, ActorId, _, Password) => {
	// We don't check the balance, because this event is just for spending money
	if (Math.sign(request.starcoins) != 1) return;

	await addOrRemoveMoney(ActorId, -request.starcoins);
	await addFame(ActorId, false, request.starcoins / 10);

	return buildXML("Pay", await getActorDetails(ActorId, ActorId, Password));
};
