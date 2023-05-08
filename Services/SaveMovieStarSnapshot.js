const { writeFile } = require("fs");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "SaveMovieStarSnapshot",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  
  writeFile(`/var/www/mspretro/snapshots/${ActorId}.jpg`, request.data, { encoding: "base64" }, function(err) {
  });
  
  return buildXML("SaveMovieStarSnapshot", ActorId);
};