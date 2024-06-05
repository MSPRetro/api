const { userModel, friendModel, lookModel } = require("../Utils/Schemas.js");
const { buildXML, formatDate } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetActivitiesByType",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  /*
      public static const Activity_GUESTBOOK_ENTRY_ADDED:int = 6;
      
      private static var _watcherSetupUtil:IWatcherSetupUtil;
      
      public static const Activity_MYLOOK_ADDED:int = 9;
      
      public static const Activity_MYROOM_CHANGED:int = 5;
      
      public static const Activity_TWIT:int = 3;
      
      public static const Activity_PROFILE_CHANGED:int = 4;
      
      public static const Activity_MOVIE_PUBLISHED:int = 1;
      
      public static const Activity_LEVEL_UPDATED:int = 7;
      
      public static const Activity_FRIENDACCEPTED:int = 2;
      
      public static const Activity_INVITATION_BONUS_RECIEVED:int = 8;
      
          <s:element name="GetActivitiesByType">
        <s:complexType>
            <s:sequence>
                <s:element name="actorId" type="s:int"/>
                <s:element name="type" type="s:int"/>
                <s:element name="isForFriends" type="s:boolean"/>
                <s:element name="pageindex" type="s:int"/>
                <s:element name="pagesize" type="s:int"/>
            </s:sequence>
        </s:complexType>
    </s:element>
  */
  
  const user = await userModel.findOne({ ActorId: ActorId });
  
  let pagesize = 3;
  if (request.type == 5) pagesize = 4;
  
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
                $eq: [ "$Type", request.type ]
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
    { $sort: { "_Date": -1 } },
    { $skip: request.pageindex * pagesize },
    { $limit: pagesize }
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
                $eq: [ "$Type", request.type ]
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
  
  switch (request.type) {
    case 1:
      // movie published
      break;
    case 2:
      // friend accepted
      break;
    case 3:
      // new twit
      break;
    case 4:
      // friend profile changed
      break;
    case 5:
      // friend room changed
      
      for (let activity of ActivitiesFriends) {
        const ActivityUser = await userModel.findOne({ ActorId: activity.ActorId });

        ActivitiesType.push({
          ActivityId: activity.ActivityId,
          ActorId: activity.ActorId,
          Type: 5,
          _Date: formatDate(activity._Date),
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
      };
      
      break;
    case 6:
      // new guestbook on the actor's profile
      break;
    case 7:
      // new friend level
      break;
    case 8:
      // ?
      break;
    case 9:
      // new friend looks
      
      for (let activity of ActivitiesFriends) {
        const look = await lookModel.findOne({ LookId: activity.LookId, State: 0 });
        if (!look) continue;

        const ActivityUser = await userModel.findOne({ ActorId: activity.ActorId });

        ActivitiesType.push({
          ActivityId: activity.ActivityId,
          ActorId: activity.ActorId,
          Type: 9,
          _Date: formatDate(activity._Date),
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
      };
      
      break;
    default:
      return;
  }
    
  return buildXML("GetActivitiesByType", {
    totalRecords: totalRecords,
    pageindex: request.pageindex,
    pagesize: 4,
    items: {
      Activity: ActivitiesType
    }
  });
}

/*
    <s:complexType name="PagedActivityList">
        <s:sequence>
            <s:element name="totalRecords" type="s:int"/>
            <s:element name="pageindex" type="s:int"/>
            <s:element name="pagesize" type="s:int"/>
            <s:element minOccurs="0" name="items" type="tns:ArrayOfActivity"/>
        </s:sequence>
    </s:complexType>
    <s:complexType name="ArrayOfActivity">
        <s:sequence>
            <s:element maxOccurs="unbounded" minOccurs="0" name="Activity" nillable="true" type="tns:Activity"/>
        </s:sequence>
    </s:complexType>
    */

/*
    <s:complexType name="PagedActivityList">
        <s:sequence>
            <s:element name="totalRecords" type="s:int"/>
            <s:element name="pageindex" type="s:int"/>
            <s:element name="pagesize" type="s:int"/>
            <s:element minOccurs="0" name="items" type="tns:ArrayOfActivity"/>
        </s:sequence>
    </s:complexType>
    <s:complexType name="ArrayOfActivity">
        <s:sequence>
            <s:element maxOccurs="unbounded" minOccurs="0" name="Activity" nillable="true" type="tns:Activity"/>
        </s:sequence>
    </s:complexType>
    <s:complexType name="Activity">
        <s:sequence>
            <s:element name="ActivityId" type="s:int"/>
            <s:element name="ActorId" type="s:int"/>
            <s:element name="Type" type="s:int"/>
            <s:element name="_Date" type="s:dateTime"/>
            <s:element name="MovieId" nillable="true" type="s:int"/>
            <s:element name="FriendId" nillable="true" type="s:int"/>
            <s:element name="ContestId" nillable="true" type="s:int"/>
            <s:element name="LookId" nillable="true" type="s:int"/>
            <s:element minOccurs="0" name="ActivityMovie" type="tns:ActivityMovie"/>
            <s:element minOccurs="0" name="Actor" type="tns:ActivityActor"/>
            <s:element minOccurs="0" name="ActivityActor" type="tns:ActivityActor"/>
            <s:element minOccurs="0" name="ActivityContest" type="tns:ActivityContest"/>
            <s:element minOccurs="0" name="ActivityMood" type="tns:ActivityMood"/>
            <s:element minOccurs="0" name="ActivityLook" type="tns:ActivityLook"/>
        </s:sequence>
    </s:complexType>
    <s:complexType name="ActivityMovie">
        <s:sequence>
            <s:element name="MovieId" type="s:int"/>
            <s:element minOccurs="0" name="Name" type="s:string"/>
            <s:element name="ActorId" type="s:int"/>
            <s:element name="State" type="s:int"/>
            <s:element name="WatchedTotalCount" nillable="true" type="s:int"/>
            <s:element name="WatchedActorCount" nillable="true" type="s:int"/>
            <s:element name="RatedCount" nillable="true" type="s:int"/>
            <s:element name="RatedTotalScore" nillable="true" type="s:int"/>
            <s:element name="StarCoinsEarned" type="s:int"/>
            <s:element name="PublishedDate" type="s:dateTime"/>
            <s:element name="Complexity" type="s:int"/>
        </s:sequence>
    </s:complexType>
    <s:complexType name="ActivityActor">
        <s:sequence>
            <s:element name="ActorId" type="s:int"/>
            <s:element minOccurs="0" name="Name" type="s:string"/>
            <s:element name="RoomLikes" type="s:int"/>
        </s:sequence>
    </s:complexType>
    <s:complexType name="ActivityContest">
        <s:sequence>
            <s:element name="ContestId" type="s:int"/>
            <s:element minOccurs="0" name="Name" type="s:string"/>
            <s:element minOccurs="0" name="Description" type="s:string"/>
            <s:element name="Status" type="s:int"/>
            <s:element name="OpeningTime" type="s:dateTime"/>
            <s:element name="ClosingTime" type="s:dateTime"/>
            <s:element name="VotingDeadline" type="s:dateTime"/>
            <s:element name="VotingRound" type="s:int"/>
            <s:element name="MaxNumberOfVotingRounds" type="s:int"/>
            <s:element name="PrizeMoney" type="s:int"/>
            <s:element minOccurs="0" name="SWFLarge" type="s:string"/>
            <s:element minOccurs="0" name="SWFList" type="s:string"/>
        </s:sequence>
    </s:complexType>
    <s:complexType name="ActivityMood">
        <s:sequence>
            <s:element name="ActorId" type="s:int"/>
            <s:element minOccurs="0" name="FigureAnimation" type="s:string"/>
            <s:element minOccurs="0" name="FaceAnimation" type="s:string"/>
            <s:element minOccurs="0" name="MouthAnimation" type="s:string"/>
            <s:element minOccurs="0" name="TextLine" type="s:string"/>
            <s:element name="SpeechLine" nillable="true" type="s:boolean"/>
        </s:sequence>
    </s:complexType>
    <s:complexType name="ActivityLook">
        <s:sequence>
            <s:element name="LookId" type="s:int"/>
            <s:element name="ActorId" type="s:int"/>
            <s:element minOccurs="0" name="Headline" type="s:string"/>
            <s:element minOccurs="0" name="LookData" type="s:base64Binary"/>
            <s:element name="Likes" type="s:int"/>
            <s:element name="Sells" type="s:int"/>
        </s:sequence>
    </s:complexType>
    */