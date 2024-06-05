const { ticketModel, userModel } = require("../Utils/Schemas.js");
const { isModerator } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");
const { getValue } = require("../Utils/Globals.js");

exports.data = {
  SOAPAction: "GetIPUsers",
  needTicket: true,
  levelModerator: 2
};

exports.run = async (request, ActorId) => {
  const users = await ticketModel.distinct("ActorId", { IPId: request.ipAsIntToUse });
  
  const moderator = await isModerator(ActorId, false, 3);
  
  let ActorNamePass = [ ];
  
  for (let ActorId of users) {
    const user = await userModel.findOne({ ActorId: ActorId });
    let password;
    let username = user.Name == "Deleted User" ? user.LastName + " (DELETED)" : user.Name;
    
    if (moderator) {
      password = getValue(`${user.ActorId}-PASSWORD`);
      if (!password) password = "Password not found in cache"; 
    } else password = "You do not have the necessary rights to see this.";
    
    ActorNamePass.push({
      Name: username,
      Password: password,
      ActorId: user.ActorId
    });
  }
  
  return buildXML("GetIPUsers", {
    ActorNamePass: ActorNamePass
  });
}