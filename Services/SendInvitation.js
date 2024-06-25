const { sendMail, mailIsValid } = require("../Utils/MailManager.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "SendInvitation",
	needTicket: true,
	levelModerator: 0
};

exports.run = async request => {
	if (!mailIsValid(request.email)) return buildXML("SendInvitation");

	await sendMail(
		"invitation",
		request.email,
		request.fromName,
		`${request.fromName} invited you to play MSPRetro!`,
		`Hello ${request.toName},\n${request.fromName} invited you to play MSPRetro!\nDownload the game here: https://mspretro.com\n\nSee you soon!\nThe MSPRetro team`
		// `Hello ${request.toName},\n${request.fromName} invited you to play MSPRetro!\nClick here to play: https://cdn.mspretro.com/?${Buffer.from(`uid=${ActorId};fn=${request.toName};nm=${request.fromName};un=${user.Name}, "utf8"`).toString("base64")}\n\nSee you soon!\nThe MSPRetro team`
	);
	
	return buildXML("SendInvitation");
};
