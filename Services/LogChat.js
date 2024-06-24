const { logModel, userModel } = require("../Utils/Schemas.js");
const { isModerator, getNewId } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");
const { getIPData } = require("../Utils/IPUtils.js");
const { getValue, setValue } = require("../Utils/Globals.js");

exports.data = {
	SOAPAction: "LogChat",
	needTicket: true,
	levelModerator: 0
};

exports.run = async (request, ActorId, IP) => {
	if (isNaN(request.message && typeof request.message !== "string"))
		return buildXML("LogChat");

	let LogId = (await getNewId("chatlog_id")) + 1;

	const { IPId } = await getIPData(IP);

	const saveLog = new logModel({
		ActorId: ActorId,
		LogId: LogId,
		RoomId: request.roomId,
		Date: new Date(),
		IPId: IPId,
		Message: request.message
	});
	await saveLog.save();

	const user = await userModel.findOne({ ActorId: ActorId });

	if (await isModerator(user.ActorId, user, 3)) {
		await processModeratorMessage(
			user.ActorId,
			request.message.toString().replaceAll(":", "!#¤"),
			request.roomId
		);
	}

	return buildXML("LogChat");
};

const createFMSNotification = (exports.createFMSNotification = command => {
	let obj = getValue("fmsUpdates");

	if (!obj) {
		setValue("fmsUpdates", {});
		obj = getValue("fmsUpdates");
	}

	const notificationId = Object.keys(obj).length + 1;

	obj["notification" + notificationId] = command;
	setValue("fmsUpdates", obj);

	console.log(getValue("fmsUpdates"));
});

async function processModeratorMessage(moderatorId, msg) {
	const prefix = "$";
	const isCommand = msg.startsWith(prefix);

	if (isCommand) {
		const args = msg.slice(prefix.length).trim().split(/ +/g);
		const command = args.shift().toLowerCase();

		let user;

		switch (command) {
			case "logout":
				user = await userModel.findOne({ Name: args.join(" ") });

				if (!user) {
					createFMSNotification(
						`chatMessage|${moderatorId}|The username '${args.join(" ")}' you've entered for action 'logout' was incorrect. No action taken.`
					);
					break;
				}

				console.log(
					"Notifing FMS for logout of user with ActorId " +
						user.ActorId
				);
				createFMSNotification(
					"logout|" + moderatorId + "|" + user.ActorId
				);

				break;
			case "lock":
				user = await userModel.findOne({ Name: args.join(" ") });

				if (!user) {
					createFMSNotification(
						`chatMessage|${moderatorId}|The username '${args.join(" ")}' you've entered for action 'lock' was incorrect. No action taken.`
					);
					break;
				}

				console.log(
					"Notifing FMS for lockage of user with ActorId " +
						user.ActorId
				);
				createFMSNotification(
					"lock|" + moderatorId + "|" + user.ActorId
				);

				break;
			case "unlock":
				user = await userModel.findOne({ Name: args.join(" ") });

				if (!user) {
					createFMSNotification(
						`chatMessage|${moderatorId}|The username '${args.join(" ")}' you've entered for action 'unlock' was incorrect. No action taken.`
					);
					break;
				}

				console.log(
					"Notifing FMS for unlockage of user with ActorId " +
						user.ActorId
				);
				createFMSNotification(`unlock|${moderatorId}|${user.ActorId}`);

				break;
			case "logoutall":
				console.log("Notifing FMS for logging out everyone");
				createFMSNotification("logoutall|" + moderatorId);

				break;
			case "reload":
				user = await userModel.findOne({ Name: args.join(" ") });

				if (!user) {
					createFMSNotification(
						`chatMessage|${moderatorId}|The username '${args.join(" ")}' you've entered for action 'reload' was incorrect. No action taken.`
					);
					break;
				}

				console.log(
					"Notifing FMS for reload actor detials of user with ActorId " +
						user.ActorId
				);
				createFMSNotification(`reload|${moderatorId}|${user.ActorId}`);

				break;
			case "announce":
				console.log(
					"Notifing FMS about an annoucement from " + moderatorId
				);
				createFMSNotification(
					`announce|${moderatorId}|${args.join(" ")}`
				);

				break;
			case "danceall":
				const animation = args[0];
				const faceExpression = args[1] || "neutral";

				createFMSNotification(
					`animate|${moderatorId}|${animation}|${faceExpression}`
				);

				break;
			case "help":
				console.log(
					"Notifing FMS for sending help to user " + moderatorId
				);
				createFMSNotification("help|" + moderatorId);

				break;
		}
	}
}
