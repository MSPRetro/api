const { userModel, giftModel, boyfriendModel } = require("../Utils/Schemas.js");
const { buildXML, buildLevel, formatDate, addDays } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "LoadActorWithCurrentClothesBasicDataOnly",
  needTicket: false,
  levelModerator: 0
};

exports.run = async request => {
  let user = await userModel.aggregate([
    {
      $match: {
        ActorId: request.actorId
      }
    },
    {
      $lookup: {
        from: "rellids_clothes",
        let: { actorId: "$ActorId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: [ "$ActorId", "$$actorId" ] },
                  { $eq: [ "$IsWearing", 1 ] }
                ]
              }
            }
          },
          {
            $lookup: {
              from: "clothes",
              localField: "ClothId",
              foreignField: "ClothesId",
              as: "cloth"
            }
          },
          {
            $unwind: "$cloth"
          },
          {
            $project: {
              _id: 0,
              ActorClothesRelId: "$ClothesRellId",
              ActorId: "$ActorId",
              ClothesId: "$ClothId",
              Color: "$Colors",
              IsWearing: "$IsWearing",
              x: "$x",
              y: "$y",
              Cloth: {
                ClothesId: "$ClothId",
                Name: "$cloth.Name",
                SWF: "$cloth.SWF",
                ClothesCategoryId: "$cloth.ClothesCategoryId",
                Price: "$cloth.Price",
                ShopId: "$cloth.ShopId",
                SkinId: "$cloth.SkinId",
                Filename: "$cloth.Filename",
                Scale: "$cloth.Scale",
                Vip: "$cloth.Vip",
                RegNewUser: "$cloth.RegNewUser",
                sortorder: "$cloth.Sortorder",
                New: "$cloth.New",
                Discount: "$cloth.Discount",
                ClothesCategory: {
                  ClothesCategoryId: "$cloth.ClothesCategoryId",
                  Name: "$cloth.ClothesCategoryName",
                  SlotTypeId: "$cloth.SlotTypeId",
                  SlotType: {
                    SlotTypeId: "$cloth.SlotTypeId",
                    Name: "$cloth.ClothesCategoryName"
                  }
                }
              }
            }
          }
        ],
        as: "ActorClothesRels"
      }
    },
    {
      $lookup: {
        from: "friends",
        let: { actorId: "$ActorId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $or: [
                      { $eq: ["$RequesterId", "$$actorId"] },
                      { $eq: ["$ReceiverId", "$$actorId"] }
                    ]
                  },
                  { $eq: ["$Status", 1] }
                ]
              }
            }
          },
          {
            $count: "friendCount"
          }
        ],
        as: "friendCount"
      }
    },
    {
      $unwind: { path: "$friendCount", preserveNullAndEmptyArrays: true }
    },
    {
      $lookup: {
        from: "eyes",
        localField: "Clinic.EyeId",
        foreignField: "EyeId",
        pipeline: [
          {
            $project: {
              _id: 0,
              EyeId: "$EyeId",
              Name: "$Name",
              SWF: "$SWF",
              SkinId: "$SkinId"
            }
          }
        ],
        as: "eye"
      }
    },
    {
      $unwind: { path: "$eye", preserveNullAndEmptyArrays: true }
    },
    {
      $lookup: {
        from: "noses",
        localField: "Clinic.NoseId",
        foreignField: "NoseId",
        pipeline: [
          {
            $project: {
              _id: 0,
              NoseId: "$NoseId",
              Name: "$Name",
              SWF: "$SWF",
              SkinId: "$SkinId"
            }
          }
        ],
        as: "nose"
      }
    },
    {
      $unwind: { path: "$nose", preserveNullAndEmptyArrays: true }
    },
    {
      $lookup: {
        from: "mouths",
        localField: "Clinic.MouthId",
        foreignField: "MouthId",
        pipeline: [
          {
            $project: {
              _id: 0,
              MouthId: "$MouthId",
              Name: "$Name",
              SWF: "$SWF",
              SkinId: "$SkinId"
            }
          }
        ],
        as: "mouth"
      }
    },
    {
      $unwind: { path: "$mouth", preserveNullAndEmptyArrays: true }
    },
    {
      $addFields: {
        moderator: {
          $cond: {
            if: { $ne: [ "$LevelModerator", 0 ] },
            then: 1,
            else: 0
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        ActorId: 1,
        Name: 1,
        SkinSWF: "$Clinic.SkinSWF",
        SkinColor: "$Clinic.SkinColor",
        NoseId: "$Clinic.NoseId",
        EyeId: "$Clinic.EyeId",
        MouthId: "$Clinic.MouthId",
        Money: "$Progression.Money",
        EyeColors: "$Clinic.EyeColors",
        MouthColors: "$Clinic.MouthColors",
        Fame: "$Progression.Fame",
        Fortune: "$Progression.Fortune",
        FriendCount: "$friendCount.friendCount",
        IsExtra: "$Extra.IsExtra",
        InvitedByActorId: "$Extra.InvitedByActorId",
        Moderator: "$moderator",
        ValueOfGiftsReceived: "$Gifts.ValueOfGiftsReceived",
        ValueOfGiftsGiven: "$Gifts.ValueOfGiftsGiven",
        NumberOfAutographsReceived: "$Autographs.NumberOfAutographsReceived",
        NumberOfAutographsGiven: "$Autographs.NumberOfAutographsGiven",
        TimeOfLastAutographGiven: "$Autographs.TimeOfLastAutographGiven",
        MembershipPurchasedDate: "$VIP.MembershipPurchasedDate",
        MembershipTimeoutDate: "$VIP.MembershipTimeoutDate",
        MembershipGiftRecievedDate: "$VIP.MembershipGiftRecievedDate",
        TotalVipDays: "$VIP.TotalVipDays",
        FacebookId: "$Extra.FacebookId",
        ActorClothesRels: "$ActorClothesRels",
        BoyfriendData: "$boyfriendData",
        Eye: "$eye",
        Nose: "$nose",
        Mouth: "$mouth"
      }
    }
  ]);
  
  user = user[0];
  
  if (!user) return buildXML("LoadActorWithCurrentClothesBasicDataOnly", {
    ActorId: 0,
    Name: "MSPRETRO",
    Level: 0,
    SkinSWF: "maleskin",
    SkinColor: "16764057",
    NoseId: 1,
    EyeId: 1,
    MouthId: 1,
    Money: 0,
    EyeColors: "0x336600,0x000000,skincolor",
    MouthColors: "0x000000",
    Fame: 0,
    Fortune: 0,
    FriendCount: 0,
    IsExtra: 0,
    InvitedByActorId: -1,
    Moderator: 0,
    ValueOfGiftsReceived: 0,
    ValueOfGiftsGiven: 0,
    NumberOfGiftsGiven: 0,
    NumberOfGiftsReceived: 0,
    NumberOfAutographsReceived: 0,
    NumberOfAutographsGiven: 0,
    TimeOfLastAutographGiven: formatDate(new Date(0)),
    FacebookId: "",
    BoyfriendId: 115,
    BoyfriendStatus: 2,
    MembershipPurchasedDate: formatDate(new Date()),
    MembershipTimeoutDate: formatDate(addDays(new Date(), 90)),
    MembershipGiftRecievedDate: formatDate(addDays(new Date(), -1)),
    TotalVipDays: 90,
    ActorClothesRels: {
      ActorClothesRel: []
    },
    ActorAnimationRels: {},
    ActorMusicRels: {},
    ActorBackgroundRels: {},
    BoyFriend: {},
    Eye: {
      EyeId: 1,
      Name: "The Man",
      SWF: "Honey_male_eyes_2_2009",
      SkinId: 2
    },
    Nose: {
      NoseId: 1,
      Name: "Cute Nose",
      SWF: "nose_2",
      SkinId: 2
    },
    Mouth: {
      MouthId: 1,
      Name: "Basic Boy",
      SWF: "male_mouth_1",
      SkinId: 2
    }
  });
    
  let BoyfriendId;
  let BoyfriendStatus;
  let BoyFriend;
  
  const boyfriend = await boyfriendModel.findOne(
    {
      $or: [
        // { RequesterId: user.ActorId, Status: 1 },
        // { ReceiverId: user.ActorId, Status: 1 },
        { RequesterId: user.ActorId, Status: 2 },
        { ReceiverId: user.ActorId, Status: 2 }
      ]
    }
  );

  if (!boyfriend) {
    BoyFriend = { };
    BoyfriendId = 0;
    BoyfriendStatus = 0;
  } else {
    const boyfriendUser = await userModel.findOne({ ActorId: user.ActorId == boyfriend.RequesterId ? boyfriend.ReceiverId : boyfriend.RequesterId });

    BoyFriend = {
      ActorId: boyfriendUser.ActorId,
      Name: boyfriendUser.Name,
      SkinSWF: boyfriendUser.Clinic.SkinSWF
    };
 
    BoyfriendId = boyfriendUser.ActorId;
    BoyfriendStatus = boyfriend.Status;
  }
  
  return buildXML("LoadActorWithCurrentClothesBasicDataOnly", {
    ActorId: user.ActorId,
    Name: user.Name,
    Level: buildLevel(user.Fame),
    SkinSWF: user.SkinSWF,
    SkinColor: user.SkinColor,
    NoseId: user.NoseId,
    EyeId: user.EyeId,
    MouthId: user.MouthId,
    Money: user.Money,
    EyeColors: user.EyeColors,
    MouthColors: user.MouthColors,
    Fame: user.Fame,
    Fortune: user.Fortune,
    FriendCount: user.FriendCount,
    IsExtra: user.IsExtra,
    InvitedByActorId: user.InvitedByActorId,
    Moderator: user.Moderator,
    ValueOfGiftsReceived: user.ValueOfGiftsReceived,
    ValueOfGiftsGiven: user.ValueOfGiftsGiven,
    NumberOfGiftsGiven: await giftModel.countDocuments({ SenderActorId: user.ActorId }),
    NumberOfGiftsReceived: await giftModel.countDocuments({ ReceiverActorId: user.ActorId }),
    NumberOfAutographsReceived: user.NumberOfAutographsReceived,
    NumberOfAutographsGiven: user.NumberOfAutographsGiven,
    TimeOfLastAutographGiven: formatDate(user.TimeOfLastAutographGiven, true),
    FacebookId: user.FacebookId,
    BoyfriendId: BoyfriendId,
    BoyfriendStatus: BoyfriendStatus,
    MembershipPurchasedDate: formatDate(user.MembershipPurchasedDate),
    MembershipTimeoutDate: formatDate(user.MembershipTimeoutDate),
    MembershipGiftRecievedDate: formatDate(user.MembershipGiftRecievedDate),
    TotalVipDays: user.TotalVipDays,
    ActorClothesRels: {
      ActorClothesRel: user.ActorClothesRels
    },
    ActorAnimationRels: { },
    ActorMusicRels: { },
    ActorBackgroundRels: { },
    BoyFriend: BoyFriend,
    Eye: {
      EyeId: user.Eye.EyeId,
      Name: user.Eye.Name,
      SWF: user.Eye.SWF,
      SkinId: user.Eye.SkinId
    },
    Nose: {
      NoseId: user.Nose.NoseId,
      Name: user.Nose.Name,
      SWF: user.Nose.SWF,
      SkinId: user.Nose.SkinId
    },
    Mouth: {
      MouthId: user.Mouth.MouthId,
      Name: user.Mouth.Name,
      SWF: user.Mouth.SWF,
      SkinId: user.Mouth.SkinId
    }
  });
};