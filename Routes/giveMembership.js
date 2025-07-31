const yup = require("yup");
const { userModel, transactionModel } = require("../Utils/Schemas.js");
const {
	addDays,
	addOrRemoveMoney,
	getProductByKey,
	getNewId
} = require("../Utils/Util.js");

exports.data = {
	Name: "admin/giveMembership",
	Method: "POST"
};

exports.run = async (req, res) => {
	const apiKey = req.header("x-api-key");
	if (!apiKey) return res.status(404).end();

	// if x-api-key doesn't match or environment variable isn't set
	if (apiKey !== process.env.ADMIN_API_KEY || !process.env.ADMIN_API_KEY)
		return res.status(404).end();

	const schema = yup.object().shape({
		actorId: yup.number().integer().positive().required(),
		contentId: yup.string().required()
	});

	if (!schema.isValidSync(req.body)) return res.status(400).end();

	const actorId = req.body["actorId"];
	const contentId = req.body["contentId"];

	const productData = getProductByKey(contentId);
	if (!productData) return res.status(400).end();

	const user = await userModel.findOne({ ActorId: actorId });
	if (!user) return res.status(400).end();

	if (productData.amountVIPDays != 0) {
		let timeout = new Date(user.VIP.MembershipTimeoutDate).getTime();

		if (timeout == 0 || Date.now() > timeout)
			timeout = new Date(
				addDays(new Date(), productData.amountVIPDays++)
			);
		else
			timeout = new Date(
				addDays(
					user.VIP.MembershipTimeoutDate,
					productData.amountVIPDays++
				)
			);

		await userModel.updateOne(
			{ ActorId: user.ActorId },
			{
				$set: {
					"VIP.MembershipTimeoutDate": timeout,
					"VIP.MembershipGiftRecievedDate": new Date(),
					"VIP.TotalVipDays":
						user.VIP.TotalVipDays + productData.amountVIPDays--
				}
			}
		);
	}

	await addOrRemoveMoney(user.ActorId, productData.amountStarCoins);

	let TransactionId = (await getNewId("transaction_id")) + 1;

	const transaction = new transactionModel({
		TransactionId: TransactionId,
		StripeId: "",
		CheckoutDone: 1,
		ActorId: actorId,
		Amount: 0,
		Currency: "£",
		MobileNumber: "0",
		Timestamp: new Date(),
		StarCoinsBefore: user.Progression.Money,
		StarCoinsAfter: user.Progression.Money + productData.amountStarCoins,
		result_code: 1,
		content_id: `MANUAL - ${contentId}`,
		CardNumber: 0
	});
	await transaction.save();

	return res.json({ transactionId: TransactionId });
};
