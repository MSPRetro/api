const { uploadBase64 } = require("../Utils/BlobManager.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "SaveMovieStarSnapshot",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {  
  await uploadBase64(request.data, `/snapshots/${ActorId}.jpg`);
  
  return buildXML("SaveMovieStarSnapshot", ActorId);
};