const { userModel, transactionModel } = require("../Utils/Schemas.js");
const { addDays, numStr, getNewId } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "awardActorVIP",
	needTicket: true,
	levelModerator: 3
};

exports.run = async request => {
	const user = await userModel.findOne({ ActorId: request.actorId });
	if (!user) return;

	let timeout = new Date(user.VIP.MembershipTimeoutDate).getTime();

	if (timeout == 0 || Date.now() > timeout)
		timeout = new Date(addDays(new Date(), request.days++));
	else
		timeout = new Date(
			addDays(user.VIP.MembershipTimeoutDate, request.days++)
		);

	await userModel.updateOne(
		{ ActorId: request.actorId },
		{
			$set: {
				"VIP.MembershipTimeoutDate": timeout,
				"VIP.MembershipGiftRecievedDate": new Date(),
				"VIP.TotalVipDays": user.VIP.TotalVipDays + request.days--
			}
		}
	);

	let TransactionId = (await getNewId("transaction_id")) + 1;

	const transaction = new transactionModel({
		TransactionId: TransactionId,
		StripeId: "",
		CheckoutDone: 1,
		ActorId: request.actorId,
		Amount: 0,
		Currency: "£",
		MobileNumber: "0",
		Timestamp: new Date(),
		StarCoinsBefore: user.Progression.Money,
		StarCoinsAfter: user.Progression.Money,
		result_code: 1,
		content_id: `MANUAL - ${numStr(request.days, ".")} days VIP`,
		CardNumber: 0
	});
	await transaction.save();

	return buildXML("awardActorVIP");
};
