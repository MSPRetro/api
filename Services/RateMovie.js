const { movieModel, userModel, commentMovieModel } = require("../Utils/Schemas.js");
const { buildXML, formatDate, addFame, getNewId } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "RateMovie",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {  
  for (let i in request.rateMovie) {
    if (isNaN(request.rateMovie[i] && typeof request.rateMovie[i] !== "string")) request.rateMovie[i] = "";
  };
  
  const movie = await movieModel.findOne({ MovieId: request.rateMovie.MovieId });
  if (!movie || movie.ActorId == ActorId || request.rateMovie.Score <= 1 && request.rateMovie.Score >= 5 || await commentMovieModel.findOne({ MovieId: movie.MovieId, ActorId: ActorId, Score: { $ne: -1 } })) return;
  
  let RateMovieId = await getNewId("comment_movie_id") + 1;
  
  const rate = new commentMovieModel({
    RateMovieId: RateMovieId,
    MovieId: movie.MovieId,
    ActorId: ActorId,
    Score: request.rateMovie.Score,
    Comment: request.rateMovie.Comment,
    RateDate: new Date()
  });
  await rate.save();
  
  let AverageRating = request.rateMovie.Score;
  const RatedCount = await commentMovieModel.countDocuments({ MovieId: movie.MovieId, Score: { $ne: -1 } });
  
  if (RatedCount != 1) AverageRating = (movie.RatedTotalScore + request.rateMovie.Score) / movie.RatedCount;
  
  await movieModel.updateOne({ MovieId: movie.MovieId }, {
    RatedCount: RatedCount,
    RatedTotalScore: movie.RatedTotalScore + request.rateMovie.Score,
    AverageRating: AverageRating,
    StarCoinsEarned: movie.StarCoinsEarned + 50
  });
  
  let user = await userModel.findOne({ ActorId: movie.ActorId });
  
  await userModel.updateOne({ ActorId: movie.ActorId }, { $set: {
    "Progression.Money": user.Progression.Money + 50 + request.rateMovie.Score * 5 + movie.ActorWatched.length,
  }});
  
  await addFame(movie.ActorId, user, request.rateMovie.Score * 10 + movie.ActorWatched.length);
  
  for (let actor of movie.MovieActorRels) {
    if (actor.ActorId == movie.ActorId) continue;
    
    user = await userModel.findOne({ ActorId: actor.ActorId });
    if (!user) continue;
    
    await userModel.updateOne({ ActorId: actor.ActorId }, { $set: {
      "Progression.Money": user.Progression.Money + 50 + request.rateMovie.Score * 2 + movie.ActorWatched.length,
      "Progression.Fortune": user.Progression.Fortune + 50 + request.rateMovie.Score * 2 + movie.ActorWatched.length
    }});
    
    await addFame(actor.ActorId, user, request.rateMovie.Score * 5 + movie.ActorWatched.length);
  };
  
  user = await userModel.findOne({ ActorId: ActorId });
  await userModel.updateOne({ ActorId: ActorId }, { $set: {
    "Progression.Money": user.Progression.Money + 10,
    "Progression.Fortune": user.Progression.Fortune + 10
  } });
  
  return buildXML("RateMovie");
};
