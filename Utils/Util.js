const xml2js = require("xml2js");
const { pbkdf2Sync } = require("crypto");
const { setError } = require("./ErrorManager.js");
const { userModel, behaviorModel, giftModel, idModel, clothModel, confModel, pollModel, friendModel, boyfriendModel, activityModel, todoModel, ticketModel, collectionIdModel } = require("./Schemas.js");
const { getValue, setValue } = require("./Globals.js");

exports.buildXML = (action, object, ticket = "null") => {
  let obj = {
    "soap:Envelope": {
      $: {
        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
        "xmlns:soap": "http://schemas.xmlsoap.org/soap/envelope/"
      },
      "soap:Body": {}
    }
  };
  if (ticket != "null") {
    obj["soap:Envelope"]["soap:Header"] = {
      TicketHeader: {
        $: {
          xmlns: "http://moviestarplanet.com/"
        },
        Ticket: ticket
      }
    };
  }
  obj["soap:Envelope"]["soap:Body"][action + "Response"] = {
    $: {
      xmlns: "http://moviestarplanet.com/"
    }
  };
  obj["soap:Envelope"]["soap:Body"][action + "Response"][
    action + "Result"
  ] = object;
  return new xml2js.Builder().buildObject(obj);
};


exports.buildXMLnull = (action, ticket = "null") => {
  let obj = {
    "soap:Envelope": {
      $: {
        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
        "xmlns:soap": "http://schemas.xmlsoap.org/soap/envelope/"
      },
      "soap:Body": {}
    }
  };
  if (ticket != "null") {
    obj["soap:Envelope"]["soap:Header"] = {
      TicketHeader: {
        $: {
          xmlns: "http://moviestarplanet.com/"
        },
        Ticket: ticket
      }
    };
  }
  obj["soap:Envelope"]["soap:Body"][action + "Response"] = {
    $: {
      xmlns: "http://moviestarplanet.com/"
    }
  };
  return new xml2js.Builder().buildObject(obj);
};

exports.numStr = (a, b) => {
  a = "" + a;
  b = b || " ";
  let c = "",
      d = 0;
  while (a.match(/^0[0-9]/)) a = a.substr(1);
  
  for (let i = a.length-1; i >= 0; i--) {
    c = (d != 0 && d % 3 == 0) ? a[i] + b + c : a[i] + c;
    d++;
  }
  return c;
};

const formatDate = exports.formatDate = (datetime, shouldAddZ = false, shouldAddT = false) => {
  if (typeof datetime === "string") datetime = new Date(Date.parse(datetime));
  var z = "";
  var t = "T";
  if (shouldAddZ) {
    z = "Z";
    t = " ";
  };
  if (shouldAddZ && shouldAddT) {
    z = "Z";
    t = "T";
  };

  var month = datetime.getMonth() + 1;
  if (month.toString().length == 1) month = "0" + month;

  var day = datetime.getDate();
  if (day.toString().length == 1) day = "0" + day;

  var hour = datetime.getHours();
  if (hour.toString().length == 1) hour = "0" + hour;

  var minutes = datetime.getMinutes();
  if (minutes.toString().length == 1) minutes = "0" + minutes;

  var seconds = datetime.getSeconds();
  if (seconds.toString().length == 1) seconds = "0" + seconds;

  return `${datetime.getFullYear()}-${month}-${day}${t}${hour}:${minutes}:${seconds}${z}`;
};

let addDays = exports.addDays = (dateObj, numDays) => {
  dateObj.setDate(dateObj.getDate() + numDays);
  return dateObj;
};

exports.addMinutes = (dateObj, numMinutes) => {
  dateObj.setMinutes(dateObj.getMinutes() + numMinutes);
  return dateObj;
};

exports.parseDate = datetime => {
  let parse = datetime.split("-");
  parse = parse[2].split(":");
};

exports.parseRawXml = xmlObj => {
  try {
    var body = xmlObj["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0];
    if (body == "" || body == null) {
      return "";
    }
    body = body[Object.keys(body)[0]];
    var result = loopXmlData(body);
    if (xmlObj["SOAP-ENV:Envelope"].hasOwnProperty("SOAP-ENV:Header")) {
      result["TicketHeader"] = {
        Ticket: xmlObj["SOAP-ENV:Envelope"]["SOAP-ENV:Header"][0]["tns:TicketHeader"][0]["tns:Ticket"][0]
      };
    }
    return result;
  } catch {
    setError("Parse raw XML got weird response, please contact the devs.\n" + xmlObj.toString());
    return "ERROR";
  }
};

exports.buildPage = (pageIndex, pageSize, array) => {
  pageIndex++;
  return array.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
};

const buildLevel = exports.buildLevel = fames => {
  const levels = {
    0: 0,
    100: 1,
    1000: 2,
    5000: 3,
    20000: 4,
    40000: 5,
    70000: 6,
    110000: 7,
    160000: 8,
    220000: 9,
    300000: 10,
    420000: 11,
    600000: 12,
    850000: 13,
    1100000: 14,
    1500000: 15,
    2000000: 16,
    2700000: 17,
    3500000: 18,
    4500000: 19,
    7000000: 20
  };
  
  let r = -1
  for (const [key, value] of Object.entries(levels)) {
    if (key > fames) {
    r = value - 1;
    break;
    };
  };
  if (r == -1) r = 20;
  return r;
};

const isModerator = exports.isModerator = async (ActorId, user = null, level) => {
  if (!user) user = await userModel.findOne({ ActorId: ActorId });
  
  if (level != 0 && level <= user.LevelModerator) return true;
  else {
    if (user.LevelModerator == -1) {
      setError(`Your moderator permissions haven't been approved yet, please contact a game Administrator.`, true, { moderator: true });
      return false;
    }
    
    setError(`You do not have the necessary rights to do this action.\n\n[Your moderator level]: ${user.LevelModerator}\n[Required moderator level]: ${level}`, true, { moderator: true });

    return false;
  }
};

const isVip = exports.isVip = async (ActorId, user = null) => {
  if (!user) user = await userModel.findOne({ ActorId: ActorId });
  
  if (Date.now() > user.VIP.MembershipTimeoutDate) return false;
  else return true;
};

exports.addFame = async (ActorId, user = null, fames) => {  
  if (await isVip(ActorId, user)) fames = Math.round(fames + (fames * 25 / 100));
    
  await userModel.updateOne({ ActorId: ActorId }, { $inc: {
    "Progression.Fame": fames
  } });
};

const getNewId = exports.getNewId = async sequence_name => {
  const q = await collectionIdModel.findOneAndUpdate(
    { _id: sequence_name },
    { $inc: { sequence_value: 1 } },
    { new: true }
  );
  
  return q.sequence_value;
};

exports.createActivity = async (ActorId, Type, MovieId, FriendId, ContestId, LookId) => {
  if ([ 3, 4, 5, 7 ].includes(Type)) await activityModel.updateMany({ ActorId: ActorId, Type: Type }, { ActorId: 0 });
  
  let ActivityId = await getNewId("activity_id") + 1;
  
  const activity = new activityModel({
    ActivityId: ActivityId,
    ActorId: ActorId,
    Type: Type,
    _Date: new Date(),
    MovieId: MovieId,
    FriendId: FriendId,
    ContestId: ContestId,
    LookId: LookId
  });
  return await activity.save();
};

let createTodo = exports.createTodo = async (ActorId, Type, Deadline = new Date(0), MovieId, FriendId, ContestId, MovieCompetitionId, GiftId) => {
  // if ([ 3, 4, 5, 7 ].includes(Type)) await activityModel.updateMany({ ActorId: ActorId, Type: Type }, { ActorId: 0 });
  
  let TodoId = await getNewId("todo_id") + 1;
  
  const todo = new todoModel({
    TodoId: TodoId,
    ActorId: ActorId,
    Type: Type,
    Deadline: Deadline,
    FriendId: FriendId,
    MovieId: MovieId,
    ContestId: ContestId,
    MovieCompetitionId: MovieCompetitionId,
    GiftId: GiftId
  });
  return await todo.save();
};

exports.getActorDetails = async (ActorId, RellActorId, Password) => {  
  let user = await userModel.findOne({ ActorId: ActorId });
  if (!user) return { };
  
  const behavior = await behaviorModel.findOne({ ActorId: ActorId, BehaviourStatus: 1 })
  .sort({ _id: -1 });
  
  let BehaviourStatus;
  let LockedUntil;
  let LockedText = "";
  
  if (!behavior) {
    BehaviourStatus = 2;
    LockedUntil = formatDate(new Date(0), true, true);
  } else {
    BehaviourStatus = behavior.BehaviourStatus;
    
    LockedUntil = formatDate(addDays(behavior.HandledOn, behavior.LockedDays), true, true);
    LockedText = behavior.LockedText;
  };
  
  let password = "";
  let email = "";
  
  if (ActorId == RellActorId) {
    if (getValue(`${RellActorId}-LEVEL`) != buildLevel(user.Progression.Fame) && buildLevel(user.Progression.Fame) == 3 && user.Extra.InvitedByActorId != 0) {
      await createTodo(RellActorId, false, 4, 0, user.Extra.InvitedByActorId, 0, 0);
    };
    
    email = user.Email.Email;
    password = Password;
  }
  
  let config = await confModel.find({  });
  config = config[0];
  
  let PollTaken = 1;
  if (await pollModel.findOne({ ActorId: ActorId, PollId: config.PollId })) PollTaken = 1;
  else PollTaken = 0;
  
  let RoomActorLike = { };
  
  if (user.Room.RoomActorLikes.includes(RellActorId)) RoomActorLike = {
    RoomActorLike: {
      EntityType: 2,
      EntityId: ActorId,
      ActorId: RellActorId
    }
  };
  
  const FriendCount = await friendModel.countDocuments({
    $or: [
      { RequesterId: user.ActorId },
      { ReceiverId: user.ActorId }
    ],
    Status: 1
  });
  
  let BoyfriendId;
  let BoyfriendStatus;
  let BoyFriend;
  
  const boyfriend = await boyfriendModel.findOne(
    {
      $or: [
        // { RequesterId: ActorId, Status: 1 },
        // { ReceiverId: ActorId, Status: 1 },
        { RequesterId: ActorId, Status: 2 },
        { ReceiverId: ActorId, Status: 2 }
      ]
    }
  );

  if (!boyfriend) {
    BoyFriend = { };
    BoyfriendId = 0;
    BoyfriendStatus = 0;
  } else {
    const boyfriendUser = await userModel.findOne({ ActorId: ActorId == boyfriend.RequesterId ? boyfriend.ReceiverId : boyfriend.RequesterId });

    BoyFriend = {
      ActorId: boyfriendUser.ActorId,
      Name: boyfriendUser.Name,
      SkinSWF: boyfriendUser.Clinic.SkinSWF
    };

    BoyfriendId = boyfriendUser.ActorId;
    BoyfriendStatus = boyfriend.Status;
  }
  
  let moderator = 0;
  if (user.LevelModerator != 0) moderator = 1;
  
  return {
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
    FriendCount: FriendCount,
    Password: password,
    ProfileText: user.Profile.ProfileText,
    Created: formatDate(user.Profile.Created),
    LastLogin: formatDate(user.Profile.LastLogin),
    Email: email,
    Moderator: moderator,
    ProfileDisplays: user.Profile.ProfileDisplays.length,
    FavoriteMovie: user.Favorites.FavoriteMovie,
    FavoriteActor: user.Favorites.FavoriteActor,
    FavoriteActress: user.Favorites.FavoriteActress,
    FavoriteSinger: user.Favorites.FavoriteSinger,
    FavoriteSong: user.Favorites.FavoriteSong,
    IsExtra: user.Extra.IsExtra,
    HasUnreadMessages: user.Extra.HasUnreadMessages,
    Wallpaper: user.Room.Wallpaper,
    Floor: user.Room.Floor,
    InvitedByActorId: user.Extra.InvitedByActorId,
    PollTaken: PollTaken,
    ValueOfGiftsReceived: user.Gifts.ValueOfGiftsReceived,
    ValueOfGiftsGiven: user.Gifts.ValueOfGiftsGiven,
    NumberOfGiftsGiven: await giftModel.countDocuments({ SenderActorId: ActorId }),
    NumberOfGiftsReceived: await giftModel.countDocuments({ ReceiverActorId: ActorId }),
    NumberOfAutographsReceived: user.Autographs.NumberOfAutographsReceived,
    NumberOfAutographsGiven: user.Autographs.NumberOfAutographsGiven,
    TimeOfLastAutographGiven: formatDate(user.Autographs.TimeOfLastAutographGiven, true),
    FacebookId: user.Extra.FacebookId,
    BoyfriendId: BoyfriendId,
    BoyfriendStatus: BoyfriendStatus,
    MembershipPurchasedDate: formatDate(user.VIP.MembershipPurchasedDate),
    MembershipTimeoutDate: formatDate(user.VIP.MembershipTimeoutDate),
    MembershipGiftRecievedDate: formatDate(user.VIP.MembershipGiftRecievedDate), // formatDate(addDays(new Date(), -1)), // formatDate(user.VIP.MembershipGiftRecievedDateNoVIP, true),
    BehaviourStatus: BehaviourStatus,
    LockedUntil: LockedUntil,
    LockedText: LockedText,
    BadWordCount: user.Extra.BadWordCount,
    PurchaseTimeoutDate: formatDate(new Date()),
    EmailValidated: user.Email.EmailValidated,
    RetentionStatus: user.Extra.RetentionStatus,
    GiftStatus: 2, // user.Gifts.GiftStatus, If is set to 1, user can see the present given but the devs (Call action UpdateGift)
    MarketingNextStepLogins: user.Extra.MarketingNextStepLogins,
    MarketingStep: user.Extra.MarketingStep,
    TotalVipDays: user.VIP.TotalVipDays,
    RecyclePoints: user.Extra.RecyclePoints,
    EmailSettings: user.Email.EmailSettings,
    RoomLikes: user.Room.RoomActorLikes.length,
    TimeOfLastAutographGivenStr: formatDate(user.Autographs.TimeOfLastAutographGiven, true),
    BoyFriend: BoyFriend,
    RoomActorLikes: RoomActorLike
  };
};

exports.getCurrencySymbol = currency => {
  switch (currency) {
    default:
    case "EUR":
      return {
        currency: "EUR",
        symbol: "€",
        orientation: "R",
        paymentMethods: [ "card", "klarna", "ideal", "sofort", "eps" ]
      };
    case "PLN":
      return {
        currency: "PLN",
        symbol: "zł",
        orientation: "R",
        paymentMethods: [ "card", "klarna", "p24", "blik" ]
      };
    case "GBP":
      return {
        currency: "GBP",
        symbol: "£",
        orientation: "L",
        paymentMethods: [ "card", "klarna" ]
      };
    case "TRY":
      return {
        currency: "TRY",
        symbol: "TLY",
        orientation: "R",
        paymentMethods: [ "card" ]
      };
    case "USD":
      return {
        currency: "USD",
        symbol: "$US",
        orientation: "L",
        paymentMethods: [ "card" ]
      };
    case "AUD":
      return {
        currency: "AUD",
        symbol: "$AU",
        orientation: "L",
        paymentMethods: [ "card" ]
      };
    case "DKK":
      return {
        currency: "DKK",
        symbol: "kr.",
        orientation: "L",
        paymentMethods: [ "card", "klarna" ]
      };
    case "CAD":
      return {
        currency: "CAD",
        symbol: "$CA",
        orientation: "L",
        paymentMethods: [ "card" ]
      };
    case "NOK":
      return {
        currency: "NOK",
        symbol: "kr",
        orientation: "L",
        paymentMethods: [ "card", "klarna" ]
      };
    case "SEK":
      return {
        currency: "SEK",
        symbol: "kr",
        orientation: "R",
        paymentMethods: [ "card", "klarna" ]
      };
    case "NZD":
      return {
        currency: "NZD",
        symbol: "$NZ",
        orientation: "L",
        paymentMethods: [ "card" ]
      };
  }
};

function loopXmlData(xml) {
  if (Array.isArray(xml) && xml.length == 1) {
    if (typeof xml[0] === "object" && xml[0] !== null) {
      return loopXmlData(xml[0]);
    }

    if (xml[0] == "false" || xml[0] == "true") return xml[0] == "true";
    
    if (xml[0] == null) return null;

    if (!isNaN(xml[0])) return parseInt(xml[0]);
    
    return xml[0];
  };
  if (Array.isArray(xml)) {
    var result = [];
    
    for (var element of xml) {
      if (typeof element === "object" && element !== null) {
        result.push(loopXmlData(element));
        continue;
      }
      
      if (element == "false" || element == "true") {
        result.push((element == "true"));
        continue;
      }
      
      if (element == null) {  
        result.push(null);
        continue;
      }

      if (!isNaN(element)) {
        result.push(parseInt(element));
        continue;
      }
      
      var res = loopXmlData(loopXmlData);
      
      if (res == null) {
        continue;
      }
        
      
      result.push(res);
    }
    return result;
  }

  if (typeof xml === "object" && xml !== null) {

    var output = {};
    for (var name in xml) {
      if (name == "$") continue;
      var result = loopXmlData(xml[name]);
      if (typeof result === "object" && result !== null && Object.keys(result).length == 0)
        result = null;
      output[name.replace(new RegExp("tns:"), "")] = result;
    }
    return output;
  }
  return null;
};