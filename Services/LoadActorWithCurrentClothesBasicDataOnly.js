const { userModel, idModel, clothModel, giftModel, friendModel, boyfriendModel, eyeModel, noseModel, mouthModel } = require("../Utils/Schemas.js");
const { buildXML, buildLevel, formatDate, addDays } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "LoadActorWithCurrentClothesBasicDataOnly",
  needTicket: false,
  levelModerator: 0
};

exports.run = async request => {
  const user = await userModel.findOne({ ActorId: request.actorId });
  
  // For the home page
  
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
  
  const items = await idModel.find({ ActorId: request.actorId, IsWearing: 1 });
  
  let itemsArray = [ ];
  
  for (let item of items) {
    const cloth = await clothModel.findOne({ ClothesId: item.ClothId });
    
    itemsArray.push({
      ActorClothesRelId: item.ClothesRellId,
      ActorId: item.ActorId,
      ClothesId: item.ClothId,
      Color: item.Colors,
      IsWearing: item.IsWearing,
      x: 0,
      y: 0,
      Cloth: {
        ClothesId: item.ClothId,
        Name: cloth.Name,
        SWF: cloth.SWF,
        ClothesCategoryId: cloth.ClothesCategoryId,
        Price: cloth.Price,
        ShopId: 0,
        SkinId: cloth.SkinId,
        Filename: cloth.Filename,
        Scale: 0.3,
        Vip: 1,
        RegNewUser: cloth.RegNewUser,
        sortorder: 0,
        New: 0,
        Discount: 0,
        ClothesCategory: {
          ClothesCategoryId: cloth.ClothesCategoryId,
          Name: cloth.ClothesCategoryName,
          SlotTypeId: cloth.SlotTypeId,
          SlotType: {
            SlotTypeId: cloth.SlotTypeId,
            Name: cloth.ClothesCategoryName
          }
        }  
      }
    });
  };
  
  let ValueOfGiftsReceived = [ ];
  for (let gift of await giftModel.find({ ReceiverActorId: request.actorId })) {
    const relCloth = await idModel.findOne({ ClothesRellId: gift.ClothesRellId });
    const cloth = await clothModel.findOne({ ClothesId: relCloth.ClothId });
    
    ValueOfGiftsReceived.push(cloth.Price);
  };
  if (ValueOfGiftsReceived.length != 0) ValueOfGiftsReceived = ValueOfGiftsReceived.reduce((a, b) => a + b);
  else ValueOfGiftsReceived = 0;
  
  let ValueOfGiftsGiven = [ ];
  for (let gift of await giftModel.find({ SenderActorId: request.actorId })) {
    const relCloth = await idModel.findOne({ ClothesRellId: gift.ClothesRellId });
    const cloth = await clothModel.findOne({ ClothesId: relCloth.ClothId });
    
    ValueOfGiftsGiven.push(cloth.Price);
  };
  if (ValueOfGiftsGiven.length != 0) ValueOfGiftsGiven = ValueOfGiftsGiven.reduce((a, b) => a + b);
  else ValueOfGiftsGiven = 0;
  
  /*
  const friends = await friendModel.countDocuments(
    { $match: {
      $or: [
        {
          ReceiverId: request.actorId,
          Status: 1
        },
        {
          RequesterId: request.actorId,
          Status: 1
        }
      ]
    }}
  );
  */
  
  const friends1 = await friendModel.find({ RequesterId: user.ActorId, Status: 1 });
  const friends2 = await friendModel.find({ ReceiverId: user.ActorId, Status: 1 });
  
  /*  
  const boyfriend1 = await boyfriendModel.findOne({ RequesterId: request.actorId });
  const boyfriend2 = await boyfriendModel.findOne({ ReceiverId: request.actorId });
    
  let BoyfriendId;
  let BoyfriendStatus;
  let BoyFriend;
  
  if (!boyfriend1 && !boyfriend2) {
    BoyfriendId = 0;
    BoyfriendStatus = 0;
    
    BoyFriend = { };
  } else if (boyfriend1 && !boyfriend2) {
    const boyfriendUser = await userModel.findOne({ ActorId: boyfriend1.ReceiverId });
    
    switch (boyfriend1.Status) {
      case 0:
        BoyfriendId = 0;
        BoyfriendStatus = 3;
        
        BoyFriend = { };
        
        break;
      case 1:
        BoyfriendId = boyfriend1.ReceiverId;
        BoyfriendStatus = 2;
        
        BoyFriend = {
          ActorId: boyfriendUser.ActorId,
          Name: boyfriendUser.Name,
          SkinSWF: boyfriendUser.Clinic.SkinSWF
        };
        
        break;
      case 2:
        BoyfriendId = boyfriend1.ReceiverId;
        BoyfriendStatus = 1;
        
        BoyFriend = {
          ActorId: boyfriendUser.ActorId,
          Name: boyfriendUser.Name,
          SkinSWF: boyfriendUser.Clinic.SkinSWF
        };
        
        break;
    };
  } else if (!boyfriend1 && boyfriend2) {
    const boyfriendUser = await userModel.findOne({ ActorId: boyfriend2.RequesterId });
    
    switch (boyfriend2.Status) {
      case 0:
        BoyfriendId = 0;
        BoyfriendStatus = 3;
        
        BoyFriend = { };
        
        break;
      case 1:
        BoyfriendId = boyfriend2.RequesterId;
        BoyfriendStatus = 2;
        
        BoyFriend = {
          ActorId: boyfriendUser.ActorId,
          Name: boyfriendUser.Name,
          SkinSWF: boyfriendUser.Clinic.SkinSWF
        };
        
        break;
      case 2:
        BoyfriendId = boyfriend2.RequesterId;
        BoyfriendStatus = 1;
        
        BoyFriend = {
          ActorId: boyfriendUser.ActorId,
          Name: boyfriendUser.Name,
          SkinSWF: boyfriendUser.Clinic.SkinSWF
        };
        
        break;
    };
  };
  */
  
    let BoyfriendId;
  let BoyfriendStatus;
  let BoyFriend;
  
  const boyfriendU1 = await boyfriendModel.findOne({ RequesterId: request.actorId, Status: 1 });
  const boyfriendU2 = await boyfriendModel.findOne({ ReceiverId: request.actorId, Status: 1 });
  
  if (!boyfriendU1 && !boyfriendU2) {
    const boyfriendU3 = await boyfriendModel.findOne({ RequesterId: request.actorId, Status: 2 });
    const boyfriendU4 = await boyfriendModel.findOne({ ReceiverId: request.actorId, Status: 2 });
    
    if (boyfriendU3 && !boyfriendU4) {
      const boyfriendUser = await userModel.findOne({ ActorId: boyfriendU3.ReceiverId });
      
      BoyFriend = {
        ActorId: boyfriendUser.ActorId,
        Name: boyfriendUser.Name,
        SkinSWF: boyfriendUser.Clinic.SkinSWF
      };
      
      BoyfriendId = boyfriendUser.ActorId;
      BoyfriendStatus = 1;
    } else if (!boyfriendU3 && boyfriendU4) {
      const boyfriendUser = await userModel.findOne({ ActorId: boyfriendU4.RequesterId });
      
      BoyFriend = {
        ActorId: boyfriendUser.ActorId,
        Name: boyfriendUser.Name,
        SkinSWF: boyfriendUser.Clinic.SkinSWF
      };
      
      BoyfriendId = boyfriendUser.ActorId;
      BoyfriendStatus = 1;
    } else {
      BoyFriend = { };
    
      BoyfriendId = 0;
      BoyfriendStatus = 0;
    }
  } else if (boyfriendU1 && !boyfriendU2) {
    const boyfriendUser = await userModel.findOne({ ActorId: boyfriendU1.ReceiverId });
    
    BoyFriend = {
      ActorId: boyfriendUser.ActorId,
      Name: boyfriendUser.Name,
      SkinSWF: boyfriendUser.Clinic.SkinSWF
    };
    
    BoyfriendId = boyfriendUser.ActorId;
    BoyfriendStatus = 2;
  } else if (!boyfriendU1 && boyfriendU2) {    
    const boyfriendUser = await userModel.findOne({ ActorId: boyfriendU2.RequesterId });
    
    BoyFriend = {
      ActorId: boyfriendUser.ActorId,
      Name: boyfriendUser.Name,
      SkinSWF: boyfriendUser.Clinic.SkinSWF
    };
    
    BoyfriendId = boyfriendUser.ActorId;
    BoyfriendStatus = 2;
  };
    
  const eye = await eyeModel.findOne({ EyeId: user.Clinic.EyeId });
  const nose = await noseModel.findOne({ NoseId: user.Clinic.NoseId });
  const mouth = await mouthModel.findOne({ MouthId: user.Clinic.MouthId });
  
  let moderator = 0;
  if (user.LevelModerator != 0) moderator = 1;
  
  return buildXML("LoadActorWithCurrentClothesBasicDataOnly", {
    ActorId: user.ActorId,
    Name: user.Name,
    Level: buildLevel(user.Progression.Fame),
    SkinSWF: user.Clinic.SkinSWF,
    SkinColor: user.Clinic.SkinColor,
    NoseId: user.Clinic.NoseId,
    EyeId: user.Clinic.EyeId,
    MouthId: user.Clinic.MouthId,
    Money: user.Progression.Money,
    EyeColors: user.Clinic.EyeColors,
    MouthColors: user.Clinic.MouthColors,
    Fame: user.Progression.Fame,
    Fortune: user.Progression.Fortune,
    FriendCount: friends1.length + friends2.length,
    IsExtra: user.Extra.IsExtra,
    InvitedByActorId: user.Extra.InvitedByActorId,
    Moderator: moderator,
    ValueOfGiftsReceived: ValueOfGiftsReceived,
    ValueOfGiftsGiven: ValueOfGiftsGiven,
    NumberOfGiftsGiven: await giftModel.countDocuments({ SenderActorId: user.ActorId }),
    NumberOfGiftsReceived: await giftModel.countDocuments({ ReceiverActorId: user.ActorId }),
    NumberOfAutographsReceived: user.Autographs.NumberOfAutographsReceived,
    NumberOfAutographsGiven: user.Autographs.NumberOfAutographsGiven,
    TimeOfLastAutographGiven: formatDate(user.Autographs.TimeOfLastAutographGiven, true),
    FacebookId: user.Extra.FacebookId,
    BoyfriendId: BoyfriendId,
    BoyfriendStatus: BoyfriendStatus,
    MembershipPurchasedDate: formatDate(user.VIP.MembershipPurchasedDate),
    MembershipTimeoutDate: formatDate(user.VIP.MembershipTimeoutDate),
    MembershipGiftRecievedDate: formatDate(user.VIP.MembershipGiftRecievedDate),
    TotalVipDays: user.VIP.TotalVipDays,
    ActorClothesRels: {
      ActorClothesRel: itemsArray
    },
    ActorAnimationRels: { },
    ActorMusicRels: { },
    ActorBackgroundRels: { },
    BoyFriend: BoyFriend,
    Eye: {
      EyeId: eye.EyeId,
      Name: eye.Name,
      SWF: eye.SWF,
      SkinId: eye.SkinId
    },
    Nose: {
      NoseId: nose.NoseId,
      Name: nose.Name,
      SWF: nose.SWF,
      SkinId: nose.SkinId
    },
    Mouth: {
      MouthId: mouth.MouthId,
      Name: mouth.Name,
      SWF: mouth.SWF,
      SkinId: mouth.SkinId
    }
  });
};