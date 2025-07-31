const { emailClient } = require("../mspretro.js");

exports.sendMail = async (from, toEmail, toName, subject, content) => {
	return false;
	if (!mailIsValid(toEmail)) return false;

	let bcc = [];

	if (from === "order") {
		bcc = [
			{
				address: process.env.CUSTOMCONNSTR_TrustpilotEmail,
				name: "Trustpilot"
			}
		];
	}

	const email = {
		senderAddress: from + "@donotreply.mspretro.com",
		content: {
			subject: subject,
			plainText: content
		},
		recipients: {
			to: [
				{
					address: toEmail,
					name: toName
				}
			],
			bcc
		}
	};

	try {
		const poller = await emailClient.beginSend(email);
		if (!poller.getOperationState().isStarted) return false;

		const response = await poller.pollUntilDone();
		if (!response || response.Status !== "Succeeded") return false;

		return true;
	} catch {
		return false;
	}
};

const mailIsValid = (exports.mailIsValid = mail => {
	if (
		/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
			mail
		)
	)
		return true;
	else return false;
});
