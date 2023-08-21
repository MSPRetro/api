const { IPModel, logModel, userModel } = require("../Utils/Schemas.js");
const { buildXML, formatDate, isModerator, getNewId } = require("../Utils/Util.js");
const { getValue, setValue } = require("../Utils/Globals.js");
const { ChatLogWebhook } = require("../config.json");
const fetch = require("node-fetch");

exports.data = {
  SOAPAction: "LogChat",
  needTicket: true,
  levelModerator: 0,
};

exports.run = async (request, ActorId, IP) => {
  if (isNaN(request.message && typeof request.message !== "string")) return buildXML("LogChat");

  const IPData = await IPModel.findOne({ IP: IP });
  
  let LogId = await getNewId("chatlog_id") + 1;

  const saveLog = new logModel({
    ActorId: ActorId,
    LogId: LogId,
    RoomId: request.roomId,
    Date: new Date(),
    IPId: IPData.IPId,
    Message: request.message,
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
  
  /*
  await fetch(ChatLogWebhook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      embeds: [
        {
          author: {
            name: "ChatLog",
            icon_url: "https://mspretro.com/assets/logo_mspretro.png",
          },
          title: `${user.Name} to ${await getRoomName(request.roomId)}`,
          thumbnail: {
            url: `https://cdn.mspretro.com/entity-snapshots/moviestar/0/${ActorId}.jpg`,
          },
          description: request.message,
          fields: [
            {
              name: "Extras",
              value: `LogId: ${LogId}\nIPId: ${IPData.IPId}`,
            },
          ],
        },
      ],
    }),
  });
  */

  return buildXML("LogChat");
};

function createFMSNotification(command) {
  const obj = getValue("fmsUpdates");
  
  if (!obj) {
    setValue("fmsUpdates", { });
    obj = getValue("fmsUpdates");
  }
  
  const notificationId = Object.keys(obj).length + 1;

  obj["notification" + notificationId] = command;
  setValue("fmsUpdates", obj);

  console.log(getValue("fmsUpdates"));
}

async function processModeratorMessage(moderatorId, msg, roomId) {
  const prefix = "$";
  const isChatroom = [0, 1, 2, 3, 4, 5].includes(roomId);
  const isCommand = msg.startsWith(prefix);
  
  if (isCommand) {
    const args = msg.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    
    let user;
    
    switch (command) {
      case "logout":
        user = await userModel.findOne({ Name: args.join(" ") });
        
        if (!user) {
          createFMSNotification(`chatMessage|${moderatorId}|The username '${args.join(" ")}' you've entered for action 'logout' was incorrect. No action taken.`);
          break;
        }

        console.log("Notifing FMS for logout of user with ActorId " + user.ActorId);
        createFMSNotification("logout|" + moderatorId + "|" + user.ActorId);
        
        break;
      case "lock":
        user = await userModel.findOne({ Name: args.join(" ") });

        if (!user) {
          createFMSNotification(`chatMessage|${moderatorId}|The username '${args.join(" ")}' you've entered for action 'lock' was incorrect. No action taken.`);
          break;
        }

        console.log("Notifing FMS for lockage of user with ActorId " + user.ActorId);
        createFMSNotification("lock|" + moderatorId + "|" + user.ActorId);
        
        break;
      case "unlock":
        user = await userModel.findOne({ Name: args.join(" ") });

        if (!user) {
          createFMSNotification(`chatMessage|${moderatorId}|The username '${args.join(" ")}' you've entered for action 'unlock' was incorrect. No action taken.`);
          break;
        }

        console.log("Notifing FMS for unlockage of user with ActorId " + user.ActorId);
        createFMSNotification(`unlock|${moderatorId}|${user.ActorId}`);
      
        break;
      case "logoutall":
        console.log("Notifing FMS for logging out everyone");
        createFMSNotification("logoutall|" + moderatorId);
      
        break;
      case "reload":
        user = await userModel.findOne({ Name: args.join(" ") });

        if (!user) {
          createFMSNotification(`chatMessage|${moderatorId}|The username '${args.join(" ")}' you've entered for action 'reload' was incorrect. No action taken.`);
          break;
        }

        console.log("Notifing FMS for reload actor detials of user with ActorId " + user.ActorId);
        createFMSNotification(`reload|${moderatorId}|${user.ActorId}`);
        
        break;
      case "announce":        
        console.log("Notifing FMS about an annoucement from " + moderatorId);
        createFMSNotification(`announce|${moderatorId}|${args.join(" ")}`);
        
        break;
      case "danceall":        
        const animation = args[0];
        const faceExpression = args[1] || "neutral";
      
        createFMSNotification(`animate|${moderatorId}|${animation}|${faceExpression}`);
        
        break;
      case "help":
        console.log("Notifing FMS for sending help to user " + moderatorId);
        createFMSNotification("help|" + moderatorId);
        
        break;
    }
  }
}

async function getRoomName(RoomId) {
  switch (RoomId) {
    case -1:
      return "Login";
    case 0:
      return "Beach";
    case 1:
      return "Park";
    case 2:
      return "Cafe";
    case 3:
      return "Skate";
    case 4:
      return "Meet new";
    case 5:
      return "Club";
    case 7:
      return "Forum";
    case 8:
      return "Mail";
    case 9:
      return "Profile";
    case 10:
      return "Guestbook";
    case 11:
      return "Twitter";
    case 12:
      return "Movie";
    case 13:
      return "Comment";
    case 14:
      return "LookComment";
    case 15:
      return "CompComment";
    default:
      const user = await userModel.findOne({ ActorId: RoomId });
      if (!user) return "Unknown";

      return `${user.Name} (${user.ActorId})`;
  }
}