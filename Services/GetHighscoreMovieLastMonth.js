const { movieModel, friendModel, competitionModel, userModel } = require("../Utils/Schemas.js");
const { buildXML, buildXMLnull, formatDate, buildPage } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetHighscoreMovieLastMonth",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  let movies = [ ];
  let totalRecords;
  
  if (request.forFriends) {
    const friends1 = await friendModel.find({ RequesterId: ActorId, Status: 1 });
    const friends2 = await friendModel.find({ ReceiverId: ActorId, Status: 1 });
    
    for (let movie of await movieModel.find({ ActorId: ActorId, State: 100 })) movies.push(movie);

    for(let f = 0; f < friends1.length; f++) {
      if (friends1[f].ReceiverId == 1) continue;
      
      const moviesF = await movieModel.find({ ActorId: friends1[f].ReceiverId, State: 100 });
      if (moviesF.length == 0) continue;

      for (let movie of moviesF) movies.push(movie);
    };

    for(let j = 0; j < friends2.length; j++) {
      if (friends2[j].RequesterId == 1) continue;
      
      const moviesK = await movieModel.find({ ActorId: friends2[j].RequesterId, State: 100 });
      if (moviesK.length == 0) continue;

      for (let movie of moviesK) movies.push(movie);
    };
    
    switch (request.orderBy) {
      case "TOTALWATCHED": // Starcoins earned
        movies.sort((a, b) => b.StarCoinsEarned - a.StarCoinsEarned);

        break;
      case "RATING":
        movies.sort((a, b) => b.RatedTotalScore - a.RatedTotalScore);

        break;
      case "ACTORSWATCHED": // Watched by actors
        movies.sort((a, b) => b.ActorWatched.length - a.ActorWatched.length);

        break;
      default:
        return;
    };
    
    totalRecords = movies.length;
    movies = buildPage(request.pageindex, 7, movies);
  } else {
    const competition = await competitionModel.findOne({ })
    .sort({ _id: -1 });
    if (!competition) return buildXMLnull("GetHighscoreMovieLastMonth");
    
    switch (request.orderBy) {
      case "TOTALWATCHED": // Starcoins earned        
        movies = await movieModel.find({ ActorId: { $ne: 1 }, CompetitionId: competition.MovieCompetitionId })
        .sort({ StarCoinsEarned: -1 })
        .skip(request.pageindex * 7)
        .limit(7);

        break;
      case "RATING":
        movies = await movieModel.find({ ActorId: { $ne: 1 }, CompetitionId: competition.MovieCompetitionId })
        .sort({ AverageRating: -1 })
        .skip(request.pageindex * 7)
        .limit(7);

        break;
      case "ACTORSWATCHED": // Watched by actors        
        movies = await movieModel.aggregate([
          { $match: { ActorId: { $ne: 1 }, CompetitionId: competition.MovieCompetitionId } },
          { $addFields: { len: { $size: "$ActorWatched" }}},
          { $sort: { len: -1 }},
          { $skip: request.pageindex * 7 },
          { $limit: 7 }
        ]);

        break;
      default:
        return;
    };
    
    movies = await movieModel.aggregate([
      { $match: {  ActorId: { $ne: 1 }, CompetitionId: competition.MovieCompetitionId } },
      { $addFields: { len: { $size: "$CompetitionVotes" }}},
      { $sort: { len: -1 }},
      { $skip: request.pageindex * 7 },
      { $limit: 7 }
    ]);
    
    totalRecords = await movieModel.countDocuments({ CompetitionId: competition.MovieCompetitionId });
  };
  
  let leaderboardArray = [ ];
  
  for (let movie of movies) {
    const user = await userModel.findOne({ ActorId: movie.ActorId });
    
    leaderboardArray.push({
      Name: movie.Name,
      ActorId: movie.ActorId,
      MovieId: movie.MovieId,
      State: movie.State,
      WatchedTotalCount: movie.ActorWatched.length,
      WatchedActorCount: movie.ActorWatched.length,
      RatedCount: movie.RatedCount,
      PublishedDate: formatDate(movie.PublishedDate),
      AverageRating: movie.AverageRating,
      StarCoinsEarned: movie.StarCoinsEarned,
      ActorName: user.Name
    });
  }
  
  return buildXML("GetHighscoreMovieLastMonth", {
    totalRecords: totalRecords,
    pageindex: request.pageindex,
    pagesize: 7,
    items: {
      MovieHighscore: leaderboardArray
    }
  });
}