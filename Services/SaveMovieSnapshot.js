const { uploadBase64 } = require("../Utils/BlobManager.js");
const { movieModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "SaveMovieSnapshot",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  const movie = await movieModel.findOne({ MovieId: request.movieId });
  if (movie.ActorId != ActorId) return buildXML("SaveMovieSnapshot", { });
  
  const shardDir = Math.floor(request.movieId / 10000);
  await uploadBase64(request.data, `/movie-snapshots/${shardDir}/${request.movieId}.jpg`);
  
  return buildXML("SaveMovieSnapshot");
};