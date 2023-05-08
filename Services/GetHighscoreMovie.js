const { movieModel, friendModel, competitionModel, userModel } = require("../Utils/Schemas.js");
const { buildXML, buildXMLnull, formatDate, buildPage } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetHighscoreMovie",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  let movies = [ ];
  let totalRecords;
  
  if (request.forFriends) {    
    switch (request.orderBy) {
      case "TOTALWATCHED": // Starcoins earned        
        movies = await friendModel.aggregate([
          {
            $match: {
              $or: [
                {
                  ReceiverId: ActorId,
                  Status: 1,
                },
                {
                  RequesterId: ActorId,
                  Status: 1,
                }
              ]
            }
          },
          {
            $set: {
              fieldResult: {
                $cond: {
                  if: {
                    $eq: [ "$ReceiverId", ActorId ]
                  },
                  then: "$RequesterId",
                  else: "$ReceiverId"
                }
              }
            }
          },
          {
            $lookup: {
              from: "movies",
              localField: "fieldResult",
              foreignField: "ActorId",
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: [ "$State", 100 ]
                    }
                  }
                }
              ],
              as: "movie"
            }
          },
          {
            $unwind: {
              path: "$movie",
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $match: {
              movie: { $exists: true },
            }
          },
          {
            $project: {
              Name: "$movie.Name",
              ActorId: "$movie.ActorId",
              MovieId: "$movie.MovieId",
              State: "$movie.State",
              ActorWatched: "$movie.ActorWatched",
              RatedCount: "$movie.RatedCount",
              PublishedDate: "$movie.PublishedDate",
              AverageRating: "$movie.AverageRating",
              StarCoinsEarned: "$movie.StarCoinsEarned",
            }
          },
          { $sort: { StarCoinsEarned: -1 } },
          { $skip: request.pageindex * 7 },
          { $limit: 7 }
        ]);

        break;
      case "RATING":
        movies = await friendModel.aggregate([
          {
            $match: {
              $or: [
                {
                  ReceiverId: ActorId,
                  Status: 1,
                },
                {
                  RequesterId: ActorId,
                  Status: 1,
                }
              ]
            }
          },
          {
            $set: {
              fieldResult: {
                $cond: {
                  if: {
                    $eq: [ "$ReceiverId", ActorId ]
                  },
                  then: "$RequesterId",
                  else: "$ReceiverId"
                }
              }
            }
          },
          {
            $lookup: {
              from: "movies",
              localField: "fieldResult",
              foreignField: "ActorId",
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: [ "$State", 100 ]
                    }
                  }
                }
              ],
              as: "movie"
            }
          },
          {
            $unwind: {
              path: "$movie",
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $match: {
              movie: { $exists: true },
            }
          },
          {
            $project: {
              Name: "$movie.Name",
              ActorId: "$movie.ActorId",
              MovieId: "$movie.MovieId",
              State: "$movie.State",
              ActorWatched: "$movie.ActorWatched",
              RatedCount: "$movie.RatedCount",
              PublishedDate: "$movie.PublishedDate",
              AverageRating: "$movie.AverageRating",
              RatedTotalScore: "$movie.RatedTotalScore",
              StarCoinsEarned: "$movie.StarCoinsEarned",
            }
          },
          { $sort: { RatedTotalScore: -1 } },
          { $skip: request.pageindex * 7 },
          { $limit: 7 }
        ]);
        
        break;
      case "ACTORSWATCHED": // Watched by actors
        movies = await friendModel.aggregate([
          {
            $match: {
              $or: [
                {
                  ReceiverId: ActorId,
                  Status: 1,
                },
                {
                  RequesterId: ActorId,
                  Status: 1,
                }
              ]
            }
          },
          {
            $set: {
              fieldResult: {
                $cond: {
                  if: {
                    $eq: [ "$ReceiverId", ActorId ]
                  },
                  then: "$RequesterId",
                  else: "$ReceiverId"
                }
              }
            }
          },
          {
            $lookup: {
              from: "movies",
              localField: "fieldResult",
              foreignField: "ActorId",
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: [ "$State", 100 ]
                    }
                  }
                }
              ],
              as: "movie"
            }
          },
          {
            $unwind: {
              path: "$movie",
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $match: {
              movie: { $exists: true },
            }
          },
          { $addFields: { len: { $size: "$movie.ActorWatched" }}},
          { $sort: { len: -1 }},
          {
            $project: {
              Name: "$movie.Name",
              ActorId: "$movie.ActorId",
              MovieId: "$movie.MovieId",
              State: "$movie.State",
              ActorWatched: "$movie.ActorWatched",
              RatedCount: "$movie.RatedCount",
              PublishedDate: "$movie.PublishedDate",
              AverageRating: "$movie.AverageRating",
              RatedTotalScore: "$movie.RatedTotalScore",
              StarCoinsEarned: "$movie.StarCoinsEarned",
            }
          },
          { $skip: request.pageindex * 7 },
          { $limit: 7 }
        ]);

        break;
      default:
        return;
    };
    
    console.log(movies);
    
    totalRecords = movies.length;
    movies = buildPage(request.pageindex, 7, movies);
  } else {
    const competition = await competitionModel.findOne({ })
    .sort({ _id: -1 });
    if (!competition) return buildXMLnull("GetHighscoreMovie");
    
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
  
  return buildXML("GetHighscoreMovie", {
    totalRecords: totalRecords,
    pageindex: request.pageindex,
    pagesize: 7,
    items: {
      MovieHighscore: leaderboardArray
    }
  });
}