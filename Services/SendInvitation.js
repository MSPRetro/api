const { sendMail, mailIsValid } = require("../Utils/MailManager.js");
const { userModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "SendInvitation",
	needTicket: true,
	levelModerator: 0
};

exports.run = async (request, ActorId) => {
	if (!mailIsValid(request.email)) return buildXML("SendInvitation");

	const user = await userModel.findOne({ Actorid: ActorId });

	if (
		!(await sendMail(
			"invitation",
			request.email,
			request.fromName,
			`${request.fromName} invited you to play MSPRetro!`,
			`Hello ${request.toName},\n${request.fromName} invited you to play MSPRetro!\nClick here to play: https://cdn.mspretro.com/?${Buffer.from(`uid=${ActorId};fn=${request.toName};nm=${request.fromName};un=${user.Name}, "utf8"`).toString("base64")}\n\nSee you soon!\The MSPRetro team`
		))
	)
		return buildXML("SendInvitation");
	else return buildXML("SendInvitation");
};

// chaxlgiw9E21+hod+z4f

// SendInvitation is not coded! args: {"email":"test@test.lol","toName":"My friend's name","fromName":"My name here","queryparams":"dWlkPTI7Zm49TXkgZnJpZW5kJ3MgbmFtZTtubT1NeSBuYW1lIGhlcmU7dW49cGFwaSBwYXAgcG9s\nbw==","TicketHeader":{"Ticket":"2,1648139702904,KxLPOFfLiYQ4pQxn9KrxrAMp5my72hCpzqVsLEhC"}}
