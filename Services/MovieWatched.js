const { commentMovieModel, movieModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "MovieWatched",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  let watched;

  if (await commentMovieModel.findOne({ MovieId: request.movieId, ActorId: ActorId, Score: { $ne: -1 } })) watched = true;
  else {
    const movie = await movieModel.findOne({ MovieId: request.movieId });
    if (!movie) return;
    
    if (movie.ActorWatched.includes(ActorId)) return buildXML("MovieWatched", false);
    
    await movieModel.updateOne({ MovieId: movie.MovieId }, { $push: {
      ActorWatched: ActorId
    } });
    
    watched = false;
  }
  
  return buildXML("MovieWatched", watched);
};