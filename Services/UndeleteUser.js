const { generate } = require("generate-password");
const { pbkdf2Sync } = require("crypto");
const { userModel } = require("../Utils/Schemas.js");
const { buildXML, isModerator, getActorDetails } = require("../Utils/Util.js");
const { setValue } = require("../Utils/Globals.js");

exports.data = {
  SOAPAction: "UndeleteUser",
  needTicket: true,
  levelModerator: 3
};

exports.run = async (request, ActorId, IP, Password) => {
  const user = await userModel.findOne({ ActorId: request.actorId });
  if (!user) return;
  
  if (await isModerator(user.ActorId, user, 1)) return;

  const passwordNew = generate({ length: 8, numbers: true });

  await userModel.updateOne({ ActorId: user.ActorId }, { $set: {
    Name: user.LastName,
    "Extra.IsExtra": 0,
    Password: pbkdf2Sync(`MSPRETRO,${passwordNew}`, process.env.CUSTOMCONNSTR_SaltDB, 1000, 64, "sha512").toString("hex"),
    BlockedIpAsInt: 0
  }});

  setValue(`${user.ActorId}-PASSWORD`, passwordNew);
  
  return buildXML("UndeleteUser", await getActorDetails(user.ActorId, user.ActorId, Password));
};