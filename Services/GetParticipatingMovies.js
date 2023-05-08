const { movieModel, userModel } = require("../Utils/Schemas.js");
const { buildXML, buildPage, formatDate } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetParticipatingMovies",
  needTicket: false,
  levelModerator: 0
};

exports.run = async request => {
  const movies = await movieModel.find({ CompetitionId: request.competitionId });
  
  let moviesArray = [ ];
  
  for (let movie of movies) {
    const user = await userModel.findOne({ ActorId: movie.ActorId });
    
    moviesArray.push({
      MovieId: movie.MovieId,
      Name: movie.Name,
      ActorId: movie.ActorId,
      State: movie.State,
      WatchedTotalCount: movie.ActorWatched.length,
      WatchedActorCount: movie.ActorWatched.length,
      RatedCount: movie.RatedCount,
      RatedTotalScore: movie.RatedTotalScore,
      CreatedDate: formatDate(movie.CreatedDate),
      PublishedDate: formatDate(movie.PublishedDate),
      AverageRating: movie.AverageRating,
      StarCoinsEarned: movie.StarCoinsEarned,
      Complexity: movie.Complexity,
      competitiondate: formatDate(movie.CompetitionDate),
      MovieCompetitionActor: {
        ActorId: user.ActorId,
        Name: user.Name
      }
    })
  };
  
  moviesArray.sort(function(a, b) {
    return new Date(b.date) - new Date(a.date);
  });
  
  let totalRecords = moviesArray.length;
  moviesArray = buildPage(request.pageindex, 3, moviesArray);
  
  return buildXML("GetParticipatingMovies", {
    totalRecords: totalRecords,
    pageindex: request.pageindex,
    pagesize: 3,
    items: {
      MovieCompetitionMovie: moviesArray
    }
  });
}