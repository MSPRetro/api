const { generate } = require("generate-password");
const { pbkdf2Sync } = require("crypto");
const { setValue } = require("../Utils/Globals.js");
const { sendMail } = require("../Utils/MailManager.js");
const { userModel, ticketModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "RecoverUserFromEmailHistory",
	needTicket: false,
	levelModerator: 0
};

exports.run = async request => {
	const user = await userModel
		.findOne({ Name: request.actorName, "Extra.IsExtra": 0 })
		.collation({ locale: "en", strength: 2 });

	if (
		!user ||
		user.Email.FirstEmail === "" ||
		user.Email.FirstEmail !== request.email
	)
		return buildXML("RecoverUserFromEmailHistory", 0);

	const password = generate({ length: 8, numbers: true });

	await userModel.updateOne(
		{ ActorId: user.ActorId },
		{
			$set: {
				Password: pbkdf2Sync(
					`MSPRETRO,${password}`,
					process.env.CUSTOMCONNSTR_SaltDB,
					1000,
					64,
					"sha512"
				).toString("hex"),
				"Email.Email": user.Email.FirstEmail
			}
		}
	);

	await ticketModel.updateMany(
		{ ActorId: user.ActorId, Disable: false },
		{ Disable: true }
	);
	setValue(`${user.ActorId}-PASSWORD`, password);

	if (
		await sendMail(
			"recover",
			request.email,
			user.Name,
			"Email and password recovery",
			`Hello ${user.Name},\n\ngreetings!\nWe have received a request to change your password and your email. If you have not done so, please contact the MSPRetro assistance at contact@mspretro.com.\nNew email: ${request.email}\nNew password: ${password}\n\nKind regards,\nThe MSPRetro team`
		)
	)
		return buildXML("RecoverUserFromEmailHistory", -1);
	else return buildXML("RecoverUserFromEmailHistory", 1);

	// -1 : An error has occured
	// 1 : Password sent
};
