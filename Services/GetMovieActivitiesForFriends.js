const { userModel, friendModel, movieModel } = require("../Utils/Schemas.js");
const { buildXML, formatDate, buildPage } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetMovieActivitiesForFriends",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  const user = await userModel.findOne({ ActorId: ActorId });

  const ActivitiesFriends = await friendModel.aggregate([
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
        from: "activities",
        localField: "fieldResult",
        foreignField: "ActorId",
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [ "$Type", 1 ]
              }
            }
          }
        ],
        as: "activity"
      }
    },
    {
      $unwind: {
        path: "$activity",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $match: {
        activity: { $exists: true }
      }
    },
    {
      $project: {
        ActivityId: "$activity.ActivityId",
        ActorId: "$activity.ActorId",
        Type: "$activity.Type",
        _Date: "$activity._Date",
        MovieId: "$activity.MovieId",
        FriendId: "$activity.FriendId",
        ContestId: "$activity.ContestId",
        LookId: "$activity.LookId",
      }
    },
    { $sort: { _Date: -1 } },
    { $skip: request.pageindex * 4 },
    { $limit: 4 }
  ]);
  
  let totalRecords = await friendModel.aggregate([
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
        from: "activities",
        localField: "fieldResult",
        foreignField: "ActorId",
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [ "$Type", 1 ]
              }
            }
          }
        ],
        as: "activity"
      }
    },
    {
      $unwind: {
        path: "$activity",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $match: {
        activity: { $exists: true }
      }
    },
    {
      $project: {
        ActivityId: "$activity.ActivityId",
        ActorId: "$activity.ActorId",
        Type: "$activity.Type",
        _Date: "$activity._Date",
        MovieId: "$activity.MovieId",
        FriendId: "$activity.FriendId",
        ContestId: "$activity.ContestId",
        LookId: "$activity.LookId",
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
  
  let ActivitiesType = [ ];

  for (let activity of ActivitiesFriends) {
    const ActivityUser = await userModel.findOne({ ActorId: activity.ActorId });
    const movie = await movieModel.findOne({ MovieId: activity.MovieId });

    ActivitiesType.push({
      ActivityId: activity.ActivityId,
      ActorId: activity.ActorId,
      Type: 1,
      _Date: formatDate(activity._Date),
      MovieId: activity.MovieId,
      FriendId: 0,
      ContestId: 0,
      LookId: 0,
      ActivityMovie: {
        MovieId: movie.MovieId,
        Name: movie.Name,
        ActorId: movie.ActorId,
        State: movie.State,
        WatchedTotalCount: movie.ActorWatched.length,
        WatchedActorCount: movie.ActorWatched.length,
        RatedCount: movie.RatedCount,
        RatedTotalScore: movie.RatedTotalScore,
        StarCoinsEarned: movie.StarCoinsEarned,
        PublishedDate: formatDate(movie.PublishedDate),
        Complexity: movie.Complexity,
      },
      Actor: {
        ActorId: ActivityUser.ActorId,
        Name: ActivityUser.Name,
        RoomLikes: ActivityUser.Room.RoomActorLikes.length,
      },
      ActivityActor: {
        ActorId: user.ActorId,
        Name: user.Name,
        RoomLikes: user.Room.RoomActorLikes.length,
      },
      ActivityContest: { },
      ActivityMood: { },
      ActivityLook: { },
    });
  }
  
  return buildXML("GetMovieActivitiesForFriends", {
    totalRecords: totalRecords,
    pageindex: request.pageindex,
    pagesize: 4,
    items: {
      Activity: ActivitiesType,
    },
  });
};
