const { friendModel } = require("../Utils/Schemas.js");
const { buildXML, formatDate } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetMovieActivitiesForFriends",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {  
  let movieData = await friendModel.aggregate([
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
              },
              ActorId: { $ne: 1 },
              State: 100
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
    { $sort: { PublishedDate: -1 } },
    {
      $facet: {
        totalCount: [{ $count: "count" }],
        movies: [
          { $skip: request.pageindex * 4 },
          { $limit: 4 },
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
              StarCoinsEarned: "$StarCoinsEarned",
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
  ]);
  
  movieData = movieData[0];
  
  let ActivitiesType = [ ];

  for (let movie of movieData.movies) {
    ActivitiesType.push({
      ActivityId: 0,
      ActorId: movie.ActorId,
      Type: 1,
      _Date: formatDate(movie.PublishedDate),
      MovieId: movie.MovieId,
      FriendId: 0,
      ContestId: 0,
      LookId: 0,
      ActivityMovie: {
        MovieId: movie.MovieId,
        Name: movie.Name,
        ActorId: movie.ActorId,
        State: movie.State,
        WatchedTotalCount: movie.WatchedTotalCount,
        WatchedActorCount: movie.WatchedActorCount,
        RatedCount: movie.RatedCount,
        RatedTotalScore: movie.RatedTotalScore,
        StarCoinsEarned: movie.StarCoinsEarned,
        PublishedDate: formatDate(movie.PublishedDate),
        Complexity: movie.Complexity,
      },
      Actor: {
        ActorId: movie.ActorId,
        Name: movie.ActorName,
        RoomLikes: 0
      },
      ActivityActor: {
        ActorId: 0,
        Name: "",
        RoomLikes: 0
      },
      ActivityContest: { },
      ActivityMood: { },
      ActivityLook: { }
    });
  }
  
  return buildXML("GetMovieActivitiesForFriends", {
    totalRecords: movieData.totalCount,
    pageindex: request.pageindex,
    pagesize: 4,
    items: {
      Activity: ActivitiesType,
    },
  });
};
