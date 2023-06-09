const { friendModel, competitionModel } = require("../Utils/Schemas.js");
const { buildXML, formatDate } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetHighscoreMovie",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  let movieData;
  
  if (request.forFriends) {
    const pipeline = [
      {
        $match: {
          $or: [
            { RequesterId: ActorId },
            { ReceiverId: ActorId }
          ], 
          Status: 1
        }
      },
      {
        $lookup: {
          from: "movies", 
          let: {
            actorId: {
              $cond: [
                {
                  $eq: [ "$RequesterId", ActorId ]
                }, "$ReceiverId", "$RequesterId"
              ]
            }
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    {
                      $eq: [ "$$actorId", "$ActorId" ]
                    }
                  ]
                }
              }
            }
          ],
          as: "movies"
        }
      },
      {
        $unwind: "$movies"
      },
      {
        $replaceRoot: {
          newRoot: "$movies"
        }
      },
      {
        $unionWith: {
          coll: "movies", 
          pipeline: [
            {
              $match: {
                ActorId: ActorId
              }
            }
          ]
        }
      },
      {
        $match: {
          ActorId: { $ne: 1 },
          State: 100
        }
      },
      {
        $project: {
          _id: 0,
          Name: "$Name",
          MovieId: "$MovieId",
          ActorId: "$ActorId",
          State: "$State", 
          WatchedTotalCount: {
            $size: "$ActorWatched"
          },
          WatchedActorCount: {
            $size: "$ActorWatched"
          },
          PublishedDate: "$PublishedDate",
          AverageRating: "$AverageRating",
          StarCoinsEarned: "$StarCoinsEarned"
        }
      },
      { $sort: { StarCoinsEarned: -1 } },
      {
        $facet: {
          totalCount: [{ $count: "count" }],
          movies: [
            { $skip: request.pageindex * 7 },
            { $limit: 7 },
            {
              $lookup: {
                from: "users",
                localField: "ActorId",
                foreignField: "ActorId",
                as: "user"
              }
            },
            {
              $unwind: "$user"
            },
            {
              $project: {
                Name: 1,
                MovieId: 1,
                ActorId: 1,
                State: 1,
                WatchedTotalCount: 1,
                WatchedActorCount: 1,
                PublishedDate: 1,
                AverageRating: 1,
                StarCoinsEarned: 1,
                ActorName: "$user.Name"
              }
            }
          ]
        }
      },
      {
        $project: {
          movies: 1, 
          totalCount: {
            $arrayElemAt: [ "$totalCount.count", 0 ]
          }
        }
      }
    ];
    
    let sortStage = pipeline.find(stage => stage.hasOwnProperty("$sort"));
    
    switch (request.orderBy) {
      // the pipeline is TOTALWATCHED by default (starcoins earned)
      case "RATING":
        sortStage.$sort = { AverageRating: -1 };
        
        break;
      case "ACTORSWATCHED": // Watched by actors
        sortStage.$sort = { WatchedTotalCount: -1 };

        break;
    };
    
    movieData = await friendModel.aggregate(pipeline);
  } else {
    const pipeline = [
      { $sort: { _id: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: "movies",
          localField: "MovieCompetitionId",
          foreignField: "CompetitionId",
          as: "movies"
        }
      },
      { $unwind: "$movies" },
      {
        $replaceRoot: {
          newRoot: "$movies"
        }
      },
      {
        $project: {
          _id: 0,
          Name: "$Name",
          MovieId: "$MovieId",
          ActorId: "$ActorId",
          State: "$State",
          WatchedTotalCount: {
            $size: "$ActorWatched"
          },
          WatchedActorCount: {
            $size: "$ActorWatched"
          },
          PublishedDate: "$PublishedDate",
          AverageRating: "$AverageRating",
          StarCoinsEarned: "$StarCoinsEarned"
        }
      },
      { $sort: { StarCoinsEarned: -1 } },
      {
        $facet: {
          totalCount: [{ $count: "count" }],
          movies: [
            { $skip: 0 },
            { $limit: 7 },
            {
              $lookup: {
                from: "users",
                localField: "ActorId",
                foreignField: "ActorId",
                as: "user"
              }
            },
            { $unwind: "$user" },
            {
              $project: {
                Name: 1,
                MovieId: 1,
                ActorId: 1,
                State: 1,
                WatchedTotalCount: 1,
                WatchedActorCount: 1,
                PublishedDate: 1,
                AverageRating: 1,
                StarCoinsEarned: 1,
                ActorName: "$user.Name"
              }
            }
          ]
        }
      },
      {
        $project: {
          movies: 1,
          totalCount: {
            $arrayElemAt: ["$totalCount.count", 0]
          }
        }
      }
    ];
    
    let sortStage = pipeline.find(stage => stage.hasOwnProperty("$sort"));
    
    switch (request.orderBy) {
      // the pipeline is TOTALWATCHED by default (starcoins earned)
      case "RATING":
        sortStage.$sort = { AverageRating: -1 };
        
        break;
      case "ACTORSWATCHED": // Watched by actors
        sortStage.$sort = { WatchedTotalCount: -1 };
        
        break;
    };
    
    movieData = await competitionModel.aggregate(pipeline);
  }
  
  movieData = movieData[0];
  
  let movieArray = [ ];
  
  for (let movie of movieData.movies) {
    movieArray.push({
      Name: movie.Name,
      ActorId: movie.ActorId,
      MovieId: movie.MovieId,
      State: movie.State,
      WatchedTotalCount: movie.WatchedTotalCount,
      WatchedActorCount: movie.WatchedActorCount,
      RatedCount: movie.RatedCount,
      PublishedDate: formatDate(movie.PublishedDate),
      AverageRating: movie.AverageRating,
      StarCoinsEarned: movie.StarCoinsEarned,
      ActorName: movie.ActorName
    });
  }
  
  return buildXML("GetHighscoreMovie", {
    totalRecords: movieData.totalCount,
    pageindex: request.pageindex,
    pagesize: 7,
    items: {
      MovieHighscore: movieArray
    }
  });
}