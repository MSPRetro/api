const { pbkdf2Sync } = require("crypto");
const { userModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");
const { setValue } = require("../Utils/Globals.js");

exports.data = {
  SOAPAction: "ChangePassword",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  if (!await userModel.findOne({ ActorId: ActorId, Password: pbkdf2Sync(`MSPRETRO,${request.oldPassword}`, process.env.CUSTOMCONNSTR_SaltDB, 1000, 64, "sha512").toString("hex") })) return;
  
  await userModel.updateOne({ ActorId: ActorId }, {
    Password: pbkdf2Sync(`MSPRETRO,${request.newPassword}`, process.env.CUSTOMCONNSTR_SaltDB, 1000, 64, "sha512").toString("hex")
  });
  
  setValue(`${ActorId}-PASSWORD`, request.newPassword);
  
  return buildXML("ChangePassword");
}