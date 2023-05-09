const { generate } = require("generate-password");
const { pbkdf2Sync } = require("crypto");
const { saltDB } = require("../config.json");
const { setValue } = require("../Utils/Globals.js");
const { userModel } = require("../Utils/Schemas.js");
const { buildXML, isModerator } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "ResetPassword",
  needTicket: true,
  levelModerator: 3
};

exports.run = async request => {
  if (await isModerator(request.actorId, false, 1)) return buildXML("ResetPassword");
  
  const password = generate({ length: 8, numbers: true });
  
  await userModel.updateOne({ ActorId: request.actorId }, {
    Password: pbkdf2Sync(`MSPRETRO,${password}`, saltDB, 1000, 64, "sha512").toString("hex")
  });
  
  
  setValue(`${request.actorId}-PASSWORD`, password);
  
  return buildXML("ResetPassword", password);
};