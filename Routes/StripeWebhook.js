const { userModel, transactionModel } = require("../Utils/Schemas.js");
const {
	addDays,
	addOrRemoveMoney,
	getCurrencySymbol,
	numStr,
	getProductByKey
} = require("../Utils/Util.js");
const { sendMail } = require("../Utils/MailManager.js");
const stripe = require("stripe");

exports.data = {
	Name: "StripeWebhook",
	Method: "POST"
};

exports.run = async (req, res) => {
	const signature = req.header("stripe-signature");
	if (!signature) return res.sendStatus(404);

	let event;

	try {
		event = stripe.webhooks.constructEvent(
			req.body,
			signature,
			process.env.CUSTOMCONNSTR_StripeWebhook
		);
	} catch (err) {
		return res.status(400).send(`Webhook Error: ${err.message}`);
	}

	const transaction = await transactionModel.findOne({
		StripeId: event.data.object.id,
		CheckoutDone: 0
	});
	if (!transaction) return res.sendStatus(404);

	const productData = getProductByKey(transaction.content_id);
	const user = await userModel.findOne({ ActorId: transaction.ActorId });

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

	await transactionModel.updateOne(
		{ TransactionId: transaction.TransactionId },
		{
			CheckoutDone: 1,
			StarCoinsBefore: user.Progression.Money,
			StarCoinsAfter:
				user.Progression.Money + productData.amountStarCoins,
			result_code: 0,
			CardNumber: 0
		}
	);

	const currencyData = getCurrencySymbol(
		event.data.object.currency.toUpperCase()
	);

	sendMail(
		"order",
		event.data.object.customer_details.email,
		user.Name,
		`Order #${transaction.TransactionId}: Payment confirmed`,
		`Hello ${user.Name},\nthank you for your support! We hope you enjoy your purchase.\n\nOverview of your order:\n  Order ID: #${transaction.TransactionId}\n  Product: ${productData.description}\n  Subtotal: ${currencyLeftOrRight(currencyData, event.data.object.amount_subtotal / 100)}\n  Total: ${currencyLeftOrRight(currencyData, event.data.object.amount_total / 100)}\n  Amount of StarCoins before: ${numStr(user.Progression.Money, ".")}\n  Amount of StarCoins after: ${numStr(user.Progression.Money + productData.amountStarCoins, ".")}\n\nIf you have any questions or problems regarding this purchase, please contact us at contact@mspretro.com for assistance.\n\nGreetings,\nThe MSPRetro team`
	);

	res.sendStatus(200);
};

function currencyLeftOrRight(currencyData, price) {
	if (currencyData.orientation === "L") return currencyData.symbol + price;
	else return price + currencyData.symbol;
}
