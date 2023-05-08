const { movieModel, friendModel, userModel } = require("../Utils/Schemas.js");
const { buildXML, buildPage, formatDate } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetMovieListForActorNew",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
    
  /* request.type
  1 : Load private movies
  2 : Load user movies (in the room) OR Look public movies (Movie Town > My Movies)
  3 : Load friend movies with me (Movie Town > Watch Movies)
  4 : Load friend movies (Movie Town > Watch Movies)
  5 : Movie deleted
  */
  
  let movies;
  let totalRecords;
  
  switch (request.type) {
    case 1:
      movies = await movieModel.find({ ActorId: ActorId, State: 0 })
      .sort({ _id: -1 })
      .skip(request.pageindex * 4)
      .limit(4);
      
      totalRecords = await movieModel.countDocuments({ ActorId: ActorId, State: 0 });
      
      break;
    case 2:
      movies = await movieModel.find({ ActorId: request.actorId, State: 100 })
      .sort({ _id: -1 })
      .skip(request.pageindex * 4)
      .limit(4);
      
      totalRecords = await movieModel.countDocuments({ ActorId: request.actorId, State: 100 });
      
      break;
    case 3:
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
                  State: 100,
                  "MovieActorRels.ActorId": ActorId
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
            movie: { $exists: true }
          }
        },
        {
          $project: {
            MovieId: "$movie.MovieId",
            Name: "$movie.Name",
            ActorId: "$movie.ActorId",
            Guid: "$movie.Guid",
            State: "$movie.State",
            WatchedTotalCount: "$movie.WatchedTotalCount",
            WatchedActorCount: "$movie.WatchedActorCount",
            RatedCount: "$movie.RatedCount",
            RatedTotalScore: "$movie.RatedTotalScore",
            AverageRating: "$movie.AverageRating",
            CreatedDate: "$movie.CreatedDate",
            PublishedDate: "$movie.PublishedDate",
            StarCoinsEarned: "$movie.StarCoinsEarned",
            MovieData: "$movie.MovieData",
            Complexity: "$movie.Complexity",
            CompetitionDate: "$movie.CompetitionDate",
            CompetitionId: "$movie.CompetitionId",
            CompetitionVotes: "$movie.CompetitionVotes",
            ActorClothesData: "$movie.ActorClothesData",
            MovieActorRels: "$movie.MovieActorRels",
            Scenes: "$movie.Scenes",
            ActorWatched: "$movie.ActorWatched"
          }
        },
        { $sort: { "PublishedDate": -1 } },
        { $skip: request.pageindex * 4 },
        { $limit: 4 }
      ]);
      
      totalRecords = await friendModel.aggregate([
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
                  State: 100,
                  "MovieActorRels.ActorId": ActorId
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
            movie: { $exists: true }
          }
        },
        {
          $project: {
            MovieId: "$movie.MovieId",
            Name: "$movie.Name",
            ActorId: "$movie.ActorId",
            Guid: "$movie.Guid",
            State: "$movie.State",
            WatchedTotalCount: "$movie.WatchedTotalCount",
            WatchedActorCount: "$movie.WatchedActorCount",
            RatedCount: "$movie.RatedCount",
            RatedTotalScore: "$movie.RatedTotalScore",
            AverageRating: "$movie.AverageRating",
            CreatedDate: "$movie.CreatedDate",
            PublishedDate: "$movie.PublishedDate",
            StarCoinsEarned: "$movie.StarCoinsEarned",
            MovieData: "$movie.MovieData",
            Complexity: "$movie.Complexity",
            CompetitionDate: "$movie.CompetitionDate",
            CompetitionId: "$movie.CompetitionId",
            CompetitionVotes: "$movie.CompetitionVotes",
            ActorClothesData: "$movie.ActorClothesData",
            MovieActorRels: "$movie.MovieActorRels",
            Scenes: "$movie.Scenes",
            ActorWatched: "$movie.ActorWatched"
          }
        },
        {
          $group: {
            _id: null,
            count: {
              $sum: 1
            }
          }
        }
      ]);

      try {
        totalRecords = totalRecords[0].count;
      } catch {
        totalRecords = 0;
      }
      
      break;
    case 4:
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
                  State: 100
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
            movie: { $exists: true }
          }
        },
        {
          $project: {
            MovieId: "$movie.MovieId",
            Name: "$movie.Name",
            ActorId: "$movie.ActorId",
            Guid: "$movie.Guid",
            State: "$movie.State",
            WatchedTotalCount: "$movie.WatchedTotalCount",
            WatchedActorCount: "$movie.WatchedActorCount",
            RatedCount: "$movie.RatedCount",
            RatedTotalScore: "$movie.RatedTotalScore",
            AverageRating: "$movie.AverageRating",
            CreatedDate: "$movie.CreatedDate",
            PublishedDate: "$movie.PublishedDate",
            StarCoinsEarned: "$movie.StarCoinsEarned",
            MovieData: "$movie.MovieData",
            Complexity: "$movie.Complexity",
            CompetitionDate: "$movie.CompetitionDate",
            CompetitionId: "$movie.CompetitionId",
            CompetitionVotes: "$movie.CompetitionVotes",
            ActorClothesData: "$movie.ActorClothesData",
            MovieActorRels: "$movie.MovieActorRels",
            Scenes: "$movie.Scenes",
            ActorWatched: "$movie.ActorWatched"
          }
        },
        { $sort: { "PublishedDate": -1 } },
        { $skip: request.pageindex * 4 },
        { $limit: 4 }
      ]);
      
      totalRecords = await friendModel.aggregate([
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
                  State: 100
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
            movie: { $exists: true }
          }
        },
        {
          $project: {
            MovieId: "$movie.MovieId",
            Name: "$movie.Name",
            ActorId: "$movie.ActorId",
            Guid: "$movie.Guid",
            State: "$movie.State",
            WatchedTotalCount: "$movie.WatchedTotalCount",
            WatchedActorCount: "$movie.WatchedActorCount",
            RatedCount: "$movie.RatedCount",
            RatedTotalScore: "$movie.RatedTotalScore",
            AverageRating: "$movie.AverageRating",
            CreatedDate: "$movie.CreatedDate",
            PublishedDate: "$movie.PublishedDate",
            StarCoinsEarned: "$movie.StarCoinsEarned",
            MovieData: "$movie.MovieData",
            Complexity: "$movie.Complexity",
            CompetitionDate: "$movie.CompetitionDate",
            CompetitionId: "$movie.CompetitionId",
            CompetitionVotes: "$movie.CompetitionVotes",
            ActorClothesData: "$movie.ActorClothesData",
            MovieActorRels: "$movie.MovieActorRels",
            Scenes: "$movie.Scenes",
            ActorWatched: "$movie.ActorWatched"
          }
        },
        {
          $group: {
            _id: null,
            count: {
              $sum: 1
            }
          }
        }
      ]);

      try {
        totalRecords = totalRecords[0].count;
      } catch {
        totalRecords = 0;
      }
      
      break;
    case 6:
      movies = await movieModel.find({ ActorId: ActorId, State: { $in: [ 0, 100 ] } })
      .sort({ _id: -1 })
      .skip(request.pageindex * 4)
      .limit(4);
      
      totalRecords = await movieModel.countDocuments({ ActorId: ActorId, State: { $in: [ 0, 100 ] } });
      
      break;
    default:
      return;
  }
    
  let moviesArray = [ ];
  
  for (let movie of movies) {
    if (!movie || movie === undefined) continue;
    const user = await userModel.findOne({ ActorId: movie.ActorId });
    
    moviesArray.push({
      movieId: movie.MovieId,
      name: movie.Name,
      movieState: movie.State,
      movieGuid: movie.Guid,
      directorId: movie.ActorId,
      date: formatDate(movie.CreatedDate),
      instructorName: user.Name,
      ratedCount: movie.RatedCount,
      ratedTotalScore: movie.RatedTotalScore,
      starCoinsEarned: movie.StarCoinsEarned,
      watchTotalCount: movie.ActorWatched.length
    })
  };
  
  return buildXML("GetMovieListForActorNew", {
    totalRecords: totalRecords,
    pageindex: request.pageindex,
    pagesize: 4,
    list: {
      MovieListItem: moviesArray
    }
  });
};