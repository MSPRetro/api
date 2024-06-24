const { setError } = require("../Utils/ErrorManager.js");

exports.data = {
	SOAPAction: "GetBokuBuyUrl",
	needTicket: true,
	levelModerator: 0
};

exports.run = async () => {
	// await setError(`MSPRetro is a free game, meaning you aren’t able to buy any additional StarCoins nor VIP Membership.\nPlease join our discord server to see how to gain VIP membership. ${discord}`);

	await setError(
		`Payment by phone is currently not available. Please pay by credit card.`
	);

	return { statuscode: 500 };
};
