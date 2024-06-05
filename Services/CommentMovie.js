const { movieModel, commentMovieModel } = require("../Utils/Schemas.js");
const { getNewId } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "CommentMovie",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  const movie = await movieModel.findOne({ MovieId: request.rateMovie.MovieId });
  if (!movie) return;
  
  let RateMovieId = await getNewId("comment_movie_id") + 1;
  
  const rate = new commentMovieModel({
    RateMovieId: RateMovieId,
    MovieId: movie.MovieId,
    ActorId: ActorId,
    Score: -1,
    Comment: request.rateMovie.Comment,
    RateDate: new Date()
  });
  await rate.save();
  
  return buildXML("CommentMovie");
};