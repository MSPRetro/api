const { friendModel, userModel, movieModel, lookModel } = require("../Utils/Schemas.js");
const { buildXML, formatDate } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetTwitActivitiesForFriends",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  const user = await userModel.findOne({ ActorId: ActorId });
  
  let activityData = await friendModel.aggregate([
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
        from: "activities",
        let: {
          actorId: {
            $cond: [
              {
                $eq: [ "$RequesterId", ActorId ]
              },
              "$ReceiverId",
              "$RequesterId"
            ]
          }
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  {
                    $eq: ["$$actorId", "$ActorId"]
                  }
                ]
              }
            }
          }
        ],
        as: "activities"
      }
    },
    {
      $unwind: "$activities"
    },
    {
      $replaceRoot: {
        newRoot: "$activities"
      }
    },
    {
      $project: {
        _id: 0,
        ActivityId: "$ActivityId",
        ActorId: "$ActorId",
        Type: "$Type",
        _Date: "$_Date",
        MovieId: "$MovieId",
        FriendId: "$FriendId",
        ContestId: "$ContestId",
        LookId: "$LookId"
      }
    },
    {
      $sort: {
        _Date: -1,
      }
    },
    {
      $facet: {
        totalCount: [
          {
            $count: "count",
          }
        ],
        activities: [
          {
            $skip: request.pageindex * 3
          },
          {
            $limit: 3,
          },
          {
            $lookup: {
              from: "users",
              localField: "ActorId",
              foreignField: "ActorId",
              as: "user"
            }
          },
          {
            $unwind: "$user",
          },
          {
            $project: {
              ActivityId: 1,
              ActorId: 1,
              Type: 1,
              _Date: 1,
              MovieId: 1,
              FriendId: 1,
              ContestId: 1,
              LookId: 1
            }
          }
        ]
      }
    },
    {
      $project: {
        activities: 1, 
        totalCount: {
          $arrayElemAt: [ "$totalCount.count", 0 ]
        }
      }
    }
  ]);
  
  activityData = activityData[0];
    
  let ActivitiesType = [ ];
  
  for (let ActivityFriend of activityData.activities) {
    const ActivityUser = await userModel.findOne({ ActorId: ActivityFriend.ActorId });
      
      let FriendUser;
      if (ActivityFriend.FriendId != 0) FriendUser = await userModel.findOne({ ActorId: ActivityFriend.FriendId });
      
      switch (ActivityFriend.Type) {
        case 1:
          // movie published
          
          const movie = await movieModel.findOne({ MovieId: ActivityFriend.MovieId });

          ActivitiesType.push({
            ActivityId: ActivityFriend.ActivityId,
            ActorId: ActivityFriend.ActorId,
            Type: 1,
            _Date: formatDate(ActivityFriend._Date),
            MovieId: ActivityFriend.MovieId,
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
              Complexity: movie.Complexity
            },
            Actor: {
              ActorId: ActivityUser.ActorId,
              Name: ActivityUser.Name,
              RoomLikes: ActivityUser.Room.RoomActorLikes.length
            },
            ActivityActor: {
              ActorId: user.ActorId,
              Name: user.Name,
              RoomLikes: user.Room.RoomActorLikes.length
            },
            ActivityContest: { },
            ActivityMood: { },
            ActivityLook: { }
          });
          
          break;
        case 2:
          // friend accepted
          
          // if (ActivityFriend.FriendId !== ActorId) continue;
          
          ActivitiesType.push({
            ActivityId: ActivityFriend.ActivityId,
            ActorId: ActivityFriend.ActorId,
            Type: 2,
            _Date: formatDate(ActivityFriend._Date),
            MovieId: 0,
            FriendId: ActivityFriend.FriendId,
            ContestId: 0,
            LookId: 0,
            ActivityMovie: { },
            Actor: {
              ActorId: ActivityUser.ActorId,
              Name: ActivityUser.Name,
              RoomLikes: ActivityUser.Room.RoomActorLikes.length
            },
            ActivityActor: {
              ActorId: FriendUser.ActorId,
              Name: FriendUser.Name,
              RoomLikes: FriendUser.Room.RoomActorLikes.length
            },
            ActivityContest: { },
            ActivityMood: { },
            ActivityLook: { }
          });
          
          break;
        case 3:
          // new twit

          ActivitiesType.push({
            ActivityId: ActivityFriend.ActivityId,
            ActorId: ActivityFriend.ActorId,
            Type: 3,
            _Date: formatDate(ActivityFriend._Date),
            MovieId: 0,
            FriendId: 0,
            ContestId: 0,
            LookId: 0,
            ActivityMovie: { },
            Actor: {
              ActorId: ActivityUser.ActorId,
              Name: ActivityUser.Name,
              RoomLikes: ActivityUser.Room.RoomActorLikes.length
            },
            ActivityActor: {
              ActorId: user.ActorId,
              Name: user.Name,
              RoomLikes: user.Room.RoomActorLikes.length
            },
            ActivityContest: { },
            ActivityMood: {
              ActorId: ActivityUser.ActorId,
              FigureAnimation: ActivityUser.Mood.FigureAnimation,
              FaceAnimation: ActivityUser.Mood.FaceAnimation,
              MouthAnimation: ActivityUser.Mood.MouthAnimation,
              TextLine: ActivityUser.Mood.TextLine,
              SpeechLine: false
            },
            ActivityLook: { }
          });

          break;
        case 4:
          // friend profile changed
          
          ActivitiesType.push({
            ActivityId: ActivityFriend.ActivityId,
            ActorId: ActivityFriend.ActorId,
            Type: 4,
            _Date: formatDate(ActivityFriend._Date),
            MovieId: 0,
            FriendId: 0,
            ContestId: 0,
            LookId: 0,
            ActivityMovie: { },
            Actor: {
              ActorId: ActivityUser.ActorId,
              Name: ActivityUser.Name,
              RoomLikes: ActivityUser.Room.RoomActorLikes.length
            },
            ActivityActor: {
              ActorId: user.ActorId,
              Name: user.Name,
              RoomLikes: user.Room.RoomActorLikes.length
            },
            ActivityContest: { },
            ActivityMood: { },
            ActivityLook: { }
          });
          
          break;
        case 5:
          // friend room changed

          ActivitiesType.push({
            ActivityId: ActivityFriend.ActivityId,
            ActorId: ActivityFriend.ActorId,
            Type: 5,
            _Date: formatDate(ActivityFriend._Date),
            MovieId: 0,
            FriendId: 0,
            ContestId: 0,
            LookId: 0,
            ActivityMovie: { },
            Actor: {
              ActorId: ActivityUser.ActorId,
              Name: ActivityUser.Name,
              RoomLikes: ActivityUser.Room.RoomActorLikes.length
            },
            ActivityActor: {
              ActorId: user.ActorId,
              Name: user.Name,
              RoomLikes: user.Room.RoomActorLikes.length
            },
            ActivityContest: { },
            ActivityMood: { },
            ActivityLook: { }
          });

          break;
        case 6:
          // new guestbook on the actor's profile
                    
          ActivitiesType.push({
            ActivityId: ActivityFriend.ActivityId,
            ActorId: FriendUser.ActorId,
            Type: 6,
            _Date: formatDate(ActivityFriend._Date),
            MovieId: 0,
            FriendId: 0,
            ContestId: 0,
            LookId: 0,
            ActivityMovie: { },
            Actor: {
              ActorId: FriendUser.ActorId,
              Name: FriendUser.Name,
              RoomLikes: FriendUser.Room.RoomActorLikes.length
            },
            ActivityActor: {
              ActorId: ActivityUser.ActorId,
              Name: ActivityUser.Name,
              RoomLikes: ActivityUser.Room.RoomActorLikes.length
            },
            ActivityContest: { },
            ActivityMood: { },
            ActivityLook: { }
          });
          
          break;
        case 7:
          // new friend level
          
          ActivitiesType.push({
            ActivityId: ActivityFriend.ActivityId,
            ActorId: user.ActorId,
            Type: 7,
            _Date: formatDate(ActivityFriend._Date),
            MovieId: 0,
            FriendId: 0,
            ContestId: 0,
            LookId: 0,
            ActivityMovie: { },
            Actor: {
              ActorId: user.ActorId,
              Name: user.Name,
              RoomLikes: user.Room.RoomActorLikes.length
            },
            ActivityActor: {
              ActorId: ActivityUser.ActorId,
              Name: ActivityUser.Name,
              RoomLikes: ActivityUser.Room.RoomActorLikes.length
            },
            ActivityContest: { },
            ActivityMood: { },
            ActivityLook: { }
          });
          
          break;
        case 8:
          // ?
          break;
        case 9:
          // new friend looks

          const look = await lookModel.findOne({ LookId: ActivityFriend.LookId, State: 0 });
          if (!look) continue;

          ActivitiesType.push({
            ActivityId: ActivityFriend.ActivityId,
            ActorId: ActivityFriend.ActorId,
            Type: 9,
            _Date: formatDate(ActivityFriend._Date),
            MovieId: 0,
            FriendId: 0,
            ContestId: 0,
            LookId: look.LookId,
            ActivityMovie: { },
            Actor: {
              ActorId: ActivityUser.ActorId,
              Name: ActivityUser.Name,
              RoomLikes: ActivityUser.Room.RoomActorLikes.length
            },
            ActivityActor: {
              ActorId: user.ActorId,
              Name: user.Name,
              RoomLikes: user.Room.RoomActorLikes.length
            },
            ActivityContest: { },
            ActivityMood: { },
            ActivityLook: {
              LookId: look.LookId,
              ActorId: look.ActorId,
              Headline: look.Headline,
              LookData: look.LookData,
              Likes: look.Likes.length,
              Sells: look.Sells.length
            }
          });

          break;
      };
  };
  
  return buildXML("GetTwitActivitiesForFriends", {
    totalRecords: activityData.totalCount,
    pageindex: request.pageindex,
    pagesize: 3,
    items: {
      Activity: ActivitiesType
    }
  });
};