const { containerClient } = require("../mspretro.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "SaveEntitySnapshot",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  if (![ "look", "room", "moviestar" ].includes(request.EntityType)) return;
  
  const shardDir = Math.floor(ActorId / 10000);  
  const buffer = Buffer.from(request.data, "base64");
  
  // this is wrong for ActorId when it's a look, it's not ActorId but LookId (as it's not yet implemented in the client, it's not a pb)
  const file = containerClient.getBlockBlobClient(`/entity-snapshots/${request.EntityType}/${shardDir}/${ActorId}.jpg`);
  await file.upload(buffer, buffer.length);
  
  return buildXML("SaveEntitySnapshot");
};