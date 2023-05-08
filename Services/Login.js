const { generate } = require("generate-password");
const { pbkdf2Sync } = require("crypto");
const { userModel, ticketModel, IPModel } = require("../Utils/Schemas.js");
const { buildXML, getActorDetails, formatDate, buildLevel } = require("../Utils/Util.js");
const { generateTicket } = require("../Utils/Ticket.js");
const { getValue, deleteValue, setValue } = require("../Utils/Globals.js");
const { saltDB } = require("../config.json");
const { run } = require("./LogChat.js");

exports.data = {
  SOAPAction: "Login",
  needTicket: false,
  levelModerator: 0
};

exports.run = async (request, undefined, IP) => {  
  let hash = pbkdf2Sync(`MSPRETRO,${request.password}`, saltDB, 1000, 64, "sha512").toString("hex");
   
  const user = await userModel.findOne({ Name: request.username.toString().trim(), Password: hash })
  .collation({ locale: "en", strength: 2 });
  
  if(!user || new RegExp("\\bDeleted User\\b").test(user.Name.trim())) return buildXML("Login", {
    status: "InvalidCredentials",
    actor: { },
    blockedIpAsInt: 0,
    actorLocale: {
      string: "en_US"
    }
  }, "");
  
  run({
    roomId: -1, 
    actorId: user.ActorId, 
    message: "User login at: " + formatDate(new Date(), false) + ", status: " + (user.BlockedIpAsInt == 0 ? "Success" : "Blocked")
  }, user.ActorId, IP);
  
  if (user.BlockedIpAsInt != 0) return buildXML("Login", {
      status: "Blocked",
      actor: { },
      blockedIpAsInt: user.BlockedIpAsInt,
      actorLocale: {
        string: "en_US"
      }
  }, "");
  
  let dateLogin = new Date();
  let dateTicket = dateLogin;
  dateTicket.setHours(dateTicket.getHours() + 24);
  dateTicket = dateTicket.getTime();
  
  const IPDatas = await IPModel.findOne({ IP: IP });

  const ticket = generateTicket(user.ActorId);
  setValue(`${user.ActorId}-LEVEL`, buildLevel(user.Progression.Fame));
  setValue(`${user.ActorId}-PASSWORD`, request.password);
  
  const saveTicket = new ticketModel({
    ActorId: user.ActorId,
    Ticket: ticket,
    Date: dateTicket,
    Disable: false,
    IPId: IPDatas.IPId
  });
  await saveTicket.save();
  
  await userModel.updateOne({ ActorId: user.ActorId }, { $set: { "Profile.LastLogin": new Date(dateLogin) } } );
  
  return buildXML("Login", {
    status: "Success",
    actor: await getActorDetails(user.ActorId, user.ActorId),
    blockedIpAsInt: user.BlockedIpAsInt,
    actorLocale: {
      string: "en_US"
    }
  }, ticket);
}