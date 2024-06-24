const {
	userModel,
	priceModel,
	transactionModel
} = require("../Utils/Schemas.js");
const { getNewId, getCurrencySymbol } = require("../Utils/Util.js");
const stripe = require("stripe")(process.env.CUSTOMCONNSTR_StripeKey);

exports.data = {
	Name: "CreateCheckoutSession",
	Method: "POST"
};

exports.run = async (req, res) => {
	const user = await userModel.findOne({ ActorId: req.body.ActorId });
	if (!user) return res.sendStatus(404);

	const currencyData = getCurrencySymbol(req.body.Currency);

	const product = await priceModel.findOne({
		Key: req.body.Key,
		Currency: currencyData.currency
	});
	if (!product) return res.sendStatus(404);

	const params = `?actorId=${user.ActorId}&username=${Buffer.from(user.Name).toString("base64")}&key=${req.body.Key}`;

	const session = await stripe.checkout.sessions.create({
		payment_method_types: currencyData.paymentMethods,
		mode: "payment",
		allow_promotion_codes: true,
		line_items: [
			{
				price: product.PriceId,
				quantity: 1
			}
		],
		success_url: `${process.env.PaymentGatewayLink}/Success${params}`,
		cancel_url: `${process.env.PaymentGatewayLink}/Cancel${params}`
	});

	let TransactionId = (await getNewId("transaction_id")) + 1;

	const transaction = new transactionModel({
		TransactionId: TransactionId,
		StripeId: session.id,
		CheckoutDone: 0,
		ActorId: user.ActorId,
		Amount: session.amount_total / 100,
		Currency: currencyData.symbol,
		MobileNumber: "0",
		Timestamp: new Date(),
		StarCoinsBefore: 0,
		StarCoinsAfter: 0,
		result_code: 1,
		content_id: req.body.Key, // `MANUAL - ${numStr(request.amount, ".")} StarCoins`,
		CardNumber: 0
	});
	await transaction.save();

	// console.log(JSON.stringify(session, null, 2));

	return res.json({ url: session.url });
};
