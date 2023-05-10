const { containerClient } = require("../mspretro.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "SaveMovieStarSnapshot",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  const buffer = Buffer.from(request.data, "base64");
  
  const file = containerClient.getBlockBlobClient(`/snapshots/${ActorId}.jpg`);
  await file.upload(buffer, buffer.length);
  
  return buildXML("SaveMovieStarSnapshot", ActorId);
};