const { createFMSNotification } = require("./LogChat.js");
const { IPModel, ticketModel, userModel } = require("../Utils/Schemas.js");
const { ipInt } = require("../Utils/IPUtils.js");
const { deleteValue } = require("../Utils/Globals.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "blockIP",
  needTicket: true,
  levelModerator: 2
};

exports.run = async request => {
  const IP = await IPModel.findOne({ IPId: request.ipAsIntToBlock });
  if (!IP) return;
  
  await IPModel.updateOne({ IPId: IP.IPId }, { Locked: true });
  deleteValue(`${IP.IP}-IP`);
  
  const users = await ticketModel.distinct("ActorId", { IPId: IP.IPId });
  
  for (let ActorId of users) {
    const user = await userModel.findOne({ ActorId: ActorId });
    if (user.Name == "Deleted User") continue;
    
    createFMSNotification("logout|" + ActorId + "|" + user.ActorId);
    
    await userModel.updateOne({ ActorId: ActorId }, { $set: {
      Name: "Deleted User",
      LastName: user.Name,
      BlockedIpAsInt: IP.IPId,
      "Extra.IsExtra": 1
    }}); 
  };
  
  return buildXML("blockIP", 1);
}