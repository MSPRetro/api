const { generate } = require("generate-password");
const { pbkdf2Sync } = require("crypto");
const { uploadDefaultImg } = require("../Utils/BlobManager.js");
const { userModel, idModel, clothModel, eyeModel, noseModel, mouthModel, friendModel, ticketModel, IPModel } = require("../Utils/Schemas.js");
const { buildXML, buildLevel, formatDate, getNewId } = require("../Utils/Util.js");
const { setValue } = require("../Utils/Globals.js");
const { setError } = require("../Utils/ErrorManager.js");
const { run } = require("./LogChat.js");
const { generateTicket } = require("../Utils/Ticket.js");

let cooldown = new Set();

exports.data = {
  SOAPAction: "CreateNewUser",
  needTicket: false,
  levelModerator: 0
};

exports.run = async (request, undefined, IP) => {
  if (cooldown.has(IP)) {
    await setError("You have already created an account within the hour. Please wait before creating a new one.");
    return { statuscode: 429 };
  };
  
  for (let i in request.actor) {
    if (isNaN(request.actor[i] && typeof request.actor[i] !== "string")) request.actor[i] = "";
  };
  
  const name = request.actor.Name.toString().trim();
  
  const query = await userModel.findOne({ Name: name })
  .collation({ locale: "en", strength: 2 });
  
   // ExtrasId : 3, 4, 274, 275, 279, 416, 417, 425
  
  if (new RegExp("\\bDeleted User\\b").test(name) || query) return buildXML("CreateNewUser", {
    ActorId: -2,
    Name: "",
    Level: buildLevel(0),
    SkinSWF: request.actor.SkinSWF,
    SkinColor: request.actor.SkinColor,
    NoseId: request.actor.NoseId,
    EyeId: request.actor.EyeId,
    MouthId: request.actor.MouthId,
    Money: 0,
    EyeColors: request.actor.EyeColors,
    MouthColors: request.actor.MouthColors,
    Fame: 0,
    Fortune: 0,
    FriendCount: 0,
    Password: request.actor.Password,
    ProfileText: "",
    Created: formatDate(new Date()),
    LastLogin: formatDate(new Date()),
    Email: "mspretro@mspretro.com",
    Moderator: 0,
    ProfileDisplays: 0,
    FavoriteMovie: "",
    FavoriteActor: "",
    FavoriteActress: "",
    FavoriteSinger: "",
    FavoriteSong: "",
    IsExtra: 0,
    HasUnreadMessages: 0,
    Wallpaper: "wall0302.jpg",
    Floor: "n02-1.jpg",
    InvitedByActorId: -1,
    PollTaken: 0,
    ValueOfGiftsReceived: 0,
    ValueOfGiftsGiven: 0,
    NumberOfGiftsGiven: 0,
    NumberOfGiftsReceived: 0,
    NumberOfAutographsReceived: 0,
    NumberOfAutographsGiven: 0,
    TimeOfLastAutographGiven: formatDate(new Date(0)),
    FacebookId: "",
    BoyfriendId: 0,
    BoyfriendStatus: 0,
    MembershipPurchasedDate: formatDate(new Date(0)),
    MembershipTimeoutDate: formatDate(new Date(0)),
    MembershipGiftRecievedDate: formatDate(new Date(0)),
    BehaviourStatus: 0,
    LockedUntil: formatDate(new Date(0)),
    LockedText: "",
    BadWordCount: 0,
    PurchaseTimeoutDate: formatDate(new Date(0)),
    EmailValidated: 2,
    RetentionStatus: 0,
    GiftStatus: 0,
    MarketingNextStepLogins: 1,
    MarketingStep: 1,
    TotalVipDays: 0,
    RecyclePoints: 0,
    EmailSettings: 0,
    RoomLikes: 0,
    TimeOfLastAutographGivenStr: formatDate(new Date(0)),
    BoyFriend: { },
    RoomActorLikes: [ ]
  });
  
  let ActorId = await getNewId("actor_id") + 100;
  
  let hash = pbkdf2Sync(`MSPRETRO,${request.actor.Password}`, process.env.CUSTOMCONNSTR_SaltDB, 1000, 64, "sha512").toString("hex");
  
  if (request.clothes.ActorClothesRel2 instanceof Array) {
    for (let clothe of request.clothes.ActorClothesRel2) {
      await makeClothesRellId(clothe, ActorId);
    };
  } else if (typeof request.clothes === "number") {
  } else if (request.clothes.ActorClothesRel2.ActorClothesRelId !== undefined) {
    await makeClothesRellId(request.clothes.ActorClothesRel2, ActorId);
  };
  
  let SkinId;
  if (request.actor.SkinSWF === "femaleskin") SkinId = 1;
  else SkinId = 2;
  
  if (!await noseModel.findOne({ NoseId: request.actor.NoseId, IsDeleted: 0, SkinId: { $in: [ 0, SkinId ] } })) return;
  if (!await eyeModel.findOne({ EyeId: request.actor.EyeId, IsDeleted: 0, SkinId: { $in: [ 0, SkinId ] } })) return;
  if (!await noseModel.findOne({ MouthId: request.actor.MouthId, IsDeleted: 0, SkinId: { $in: [ 0, SkinId ] } })) return;
  
  const user = new userModel({
    ActorId: ActorId,
    LevelModerator: 0,
    Name: name,
    LastName: "",
    Password: hash,
    BlockedIpAsInt: 0,
    Email: {
      Email: "",
      Token: "",
      EmailValidated: 2,
      EmailSettings: 0
    },
    Clinic: {
      SkinSWF: request.actor.SkinSWF,
      SkinColor: request.actor.SkinColor,
      NoseId: request.actor.NoseId,
      EyeId: request.actor.EyeId,
      MouthId: request.actor.MouthId,
      EyeColors: request.actor.EyeColors,
      MouthColors: request.actor.MouthColors
    },
    Progression: {
      Money: 25000,
      Fame: 0,
      Fortune: 0
    },
    Favorites: {
      FavoriteMovie: "",
      FavoriteActor: "",
      FavoriteActress: "",
      FavoriteSinger: "",
      FavoriteSong: ""
    },
    Profile: {
      ProfileText: "",
      ProfileDisplays: [ ],
      Created: new Date(),
      LastLogin: new Date()
    },
    Room: {
      RoomActorLikes: [ ],
      Wallpaper: "wall0302.jpg",
      Floor: "n02-1.jpg"
    },
    Autographs: {
      NumberOfAutographsReceived: 0,
      NumberOfAutographsGiven: 0,
      TimeOfLastAutographGiven: new Date(0)
    },
    VIP: {
      MembershipPurchasedDate: new Date(0),
      MembershipTimeoutDate: new Date(0),
      MembershipGiftRecievedDate: new Date(0),
      PurchaseTimeoutDate: new Date(0),
      TotalVipDays: 0
    },
    Extra: {
      IsExtra: 0,
      GiftStatus: 2,
      BadWordCount: 0,
      HasUnreadMessages: 0,
      AwardMoney: 0,
      InvitedByActorId: request.actor.InvitedByActorId,
      RetentionStatus: 0,
      MarketingNextStepLogins: 1,
      MarketingStep: 1,
      RecyclePoints: 0,
      FacebookId: ""
    },
    Mood: {
      FigureAnimation: "stand",
      FaceAnimation: "neutral",
      MouthAnimation: "none",
      TextLine: ""
    },
    DiscordId: ""
  });
  await user.save();
    
  const friend = new friendModel({
    RequesterId: 1,
    ReceiverId: ActorId,
    Status: 1
  });
  await friend.save();
  
  let pathImg = "../DefaultAssets/boy_head.jpg";
  if (SkinId == 1) pathImg = "../DefaultAssets/girl_head.jpg";
  
  const shardDir = Math.floor(ActorId / 10000);
  
  await uploadDefaultImg(pathImg, `/entity-snapshots/moviestar/${shardDir}/${ActorId}.jpg`);
  await uploadDefaultImg("../DefaultAssets/room.jpg", `/entity-snapshots/room/${shardDir}/${ActorId}.jpg`);
   
  let dateLogin = new Date();
  let dateTicket = dateLogin;
  dateTicket.setHours(dateTicket.getHours() + 72);
  dateTicket = dateTicket.getTime();
  
  const ticket = generateTicket(ActorId, request.password, IP);
  setValue(`${ActorId}-LEVEL`, 0);
  setValue(`${ActorId}-PASSWORD`, request.password);
  
  const { IPId } = await IPModel.findOne({ IP: IP });
    
  const saveTicket = new ticketModel({
    ActorId: ActorId,
    Ticket: ticket,
    Date: dateTicket,
    Disable: false,
    IPId: IPId
  });
  await saveTicket.save();
  
  run({ 
    roomId: -1, 
    actorId: user.ActorId, 
    message: "User login at: " + formatDate(new Date(), false) + ", status: " + (user.BlockedIpAsInt == 0 ? "Success" : "Blocked")
  }, user.ActorId, IP);
  
  cooldown.add(IP);
  setTimeout(() => {
    cooldown.delete(IP);
  }, 3600000);

  return buildXML("CreateNewUser", {
    ActorId: ActorId,
    Name: name,
    Level: buildLevel(0),
    SkinSWF: request.actor.SkinSWF,
    SkinColor: request.actor.SkinColor,
    NoseId: request.actor.NoseId,
    EyeId: request.actor.EyeId,
    MouthId: request.actor.MouthId,
    Money: 0,
    EyeColors: request.actor.EyeColors,
    MouthColors: request.actor.MouthColors,
    Fame: 0,
    Fortune: 0,
    FriendCount: 0,
    Password: request.actor.Password,
    ProfileText: "",
    Created: formatDate(new Date()),
    LastLogin: formatDate(new Date()),
    Email: "mspretro@mspretro.tk",
    Moderator: 0,
    ProfileDisplays: 0,
    FavoriteMovie: "",
    FavoriteActor: "",
    FavoriteActress: "",
    FavoriteSinger: "",
    FavoriteSong: "",
    IsExtra: 0,
    HasUnreadMessages: 0,
    Wallpaper: "wall0302.jpg",
    Floor: "n02-1.jpg",
    InvitedByActorId: -1,
    PollTaken: 0,
    ValueOfGiftsReceived: 0,
    ValueOfGiftsGiven: 0,
    NumberOfGiftsGiven: 0,
    NumberOfGiftsReceived: 0,
    NumberOfAutographsReceived: 0,
    NumberOfAutographsGiven: 0,
    TimeOfLastAutographGiven: formatDate(new Date(0)),
    FacebookId: "",
    BoyfriendId: 0,
    BoyfriendStatus: 0,
    MembershipPurchasedDate: formatDate(new Date(0)),
    MembershipTimeoutDate: formatDate(new Date(0)),
    MembershipGiftRecievedDate: formatDate(new Date(0)),
    BehaviourStatus: 0,
    LockedUntil: formatDate(new Date(0)),
    LockedText: "",
    BadWordCount: 0,
    PurchaseTimeoutDate: formatDate(new Date(0)),
    EmailValidated: 2,
    RetentionStatus: 0,
    GiftStatus: 0,
    MarketingNextStepLogins: 1,
    MarketingStep: 1,
    TotalVipDays: 0,
    RecyclePoints: 0,
    EmailSettings: 0,
    RoomLikes: 0,
    TimeOfLastAutographGivenStr: formatDate(new Date(0)),
    BoyFriend: { },
    RoomActorLikes: [ ]
  }, ticket);
};

async function makeClothesRellId(clothe, ActorId) {
  if (!await clothModel.findOne({ ClothesId: clothe.ClothesId })) return;
    
  let rellId = await getNewId("rell_clothes_id") + 1;

  const rell = new idModel({
    ActorId: ActorId,
    ClothesRellId: rellId,
    ClothId: clothe.ClothesId,
    Colors: clothe.Color,
    x: 0,
    y: 0,
    IsWearing: 1,
    IsRecycled: 0
  });
  await rell.save();
};