const { generate } = require("generate-password");
const { pbkdf2Sync } = require("crypto");
const { userModel, ticketModel } = require("../Utils/Schemas.js");
const { getIPData } = require("../Utils/IPUtils.js");
const { getActorDetails, formatDate, buildLevel } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");
const { generateTicket } = require("../Utils/Ticket.js");
const { getValue, deleteValue, setValue } = require("../Utils/Globals.js");
const { run } = require("./LogChat.js");

exports.data = {
	SOAPAction: "Login",
	needTicket: false,
	levelModerator: 0
};

exports.run = async (request, undefined, IP) => {
	let hash = pbkdf2Sync(
		`MSPRETRO,${request.password}`,
		process.env.CUSTOMCONNSTR_SaltDB,
		1000,
		64,
		"sha512"
	).toString("hex");

	const user = await userModel
		.findOne({ Name: request.username.toString().trim(), Password: hash })
		.collation({ locale: "en", strength: 2 });

	if (!user || new RegExp("\\bDeleted User\\b").test(user.Name.trim()))
		return buildXML(
			"Login",
			{
				status: "InvalidCredentials",
				actor: {},
				blockedIpAsInt: 0,
				actorLocale: {
					string: "en_US"
				}
			},
			""
		);

	await run(
		{
			roomId: -1,
			actorId: user.ActorId,
			message:
				"User login at: " +
				formatDate(new Date(), false) +
				", status: " +
				(user.BlockedIpAsInt == 0 ? "Success" : "Blocked")
		},
		user.ActorId,
		IP
	);

	if (user.BlockedIpAsInt != 0)
		return buildXML(
			"Login",
			{
				status: "Blocked",
				actor: {},
				blockedIpAsInt: user.BlockedIpAsInt,
				actorLocale: {
					string: "en_US"
				}
			},
			""
		);

	let dateLogin = new Date();
	let dateTicket = dateLogin;
	dateTicket.setHours(dateTicket.getHours() + 24);
	dateTicket = dateTicket.getTime();
	const ticket = generateTicket(user.ActorId, request.password, IP);

	setValue(`${user.ActorId}-LEVEL`, buildLevel(user.Progression.Fame));
	setValue(`${user.ActorId}-PASSWORD`, request.password);

	const { IPId } = await getIPData(IP);

	const saveTicket = new ticketModel({
		ActorId: user.ActorId,
		// Ticket: ticket, => this should be hashed
		Date: dateTicket,
		Disable: false,
		IPId: IPId
	});
	await saveTicket.save();

	await userModel.updateOne(
		{ ActorId: user.ActorId },
		{ $set: { "Profile.LastLogin": new Date(dateLogin) } }
	);

	return buildXML(
		"Login",
		{
			status: "Success",
			actor: await getActorDetails(
				user.ActorId,
				user.ActorId,
				request.password
			),
			blockedIpAsInt: user.BlockedIpAsInt,
			actorLocale: {
				string: "en_US"
			}
		},
		ticket
	);
};
