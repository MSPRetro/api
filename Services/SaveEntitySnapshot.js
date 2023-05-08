const { writeFile } = require("fs");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "SaveEntitySnapshot",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  
  // ./Images/${ActorId}.jpg
  
  let path;
  let shardDir = Math.floor(ActorId / 10000);
  
  switch (request.EntityType) {
    case "look":
      path = `/var/www/mspretro/entity-snapshots/look/${shardDir}/${ActorId}.jpg`; // Wrong, that's not ActorId!
      break;
    case "room":
      path = `/var/www/mspretro/entity-snapshots/room/${shardDir}/${ActorId}.jpg`;
      break;
    case "moviestar":
      path = `/var/www/mspretro/entity-snapshots/moviestar/${shardDir}/${ActorId}.jpg`;
      break;
    default:
      return console.log(`[SaveEntitySnapshot] : ${request.EntityType} is not coded.`);
  };
  
  writeFile(path, request.data, { encoding: "base64" }, function(err) {
  });
  
  return buildXML("SaveEntitySnapshot");
};