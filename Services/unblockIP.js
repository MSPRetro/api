const { IPModel, userModel } = require("../Utils/Schemas.js");
const { setValue } = require("../Utils/Globals.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "unblockIP",
  needTicket: true,
  levelModerator: 3
};

exports.run = async request => {
  const IP = await IPModel.findOne({ IPId: request.ipAsIntToUnblock });
  if (!IP) return;
  
  await IPModel.updateOne({ IPId: IP.IPId }, { Locked: false });
  setValue(`${IP.IP}-IP`);
  
  const users = await userModel.distinct("ActorId", { BlockedIpAsInt: IP.IPId });
  
  for (let ActorId of users) {
    const user = await userModel.findOne({ ActorId: ActorId });
    if (user.Name !== "Deleted User") continue;
    
    await userModel.updateOne({ ActorId: ActorId }, { $set: {
      Name: user.LastName,
      BlockedIpAsInt: 0,
      "Extra.IsExtra": 0
    }}); 
  }
  
  return buildXML("unblockIP", 1);
}