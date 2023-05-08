const { writeFile } = require("fs");
const { movieModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "SaveMovieSnapshot",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
    
  const movie = await movieModel.findOne({ MovieId: request.movieId });
  if (movie.ActorId !== ActorId) return buildXML("SaveMovieSnapshot", { });
  
  // ./Images/${request.movieId}.jpg
  
  let shardDir = Math.floor(request.movieId / 10000);
  
  writeFile(`/var/www/mspretro/movie-snapshots/${shardDir}/${request.movieId}.jpg`, request.data, { encoding: "base64" }, function(err) {
  });
  
  return buildXML("SaveMovieSnapshot");
};