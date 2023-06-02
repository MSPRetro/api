const { model, Schema } = require("mongoose");

exports.errorModel = model(
  "errors",
  new Schema({
    "errorId": String,
    "error": String,
    "timestamp": Number
  })
);

exports.collectionIdModel = model(
  "ids",
  new Schema({
    _id: String,
    sequence_value: Number
  })
);

exports.userModel = model(
  "users",
  new Schema({
    ActorId: Number,
    LevelModerator: Number,
    Name: String,
    LastName: String,
    Password: String,
    Status: String,
    BlockedIpAsInt: Number,
    Email: {
      Email: String,
      FirstEmail: String,
      Token: String,
      EmailValidated: Number,
      EmailSettings: Number
    },
    Clinic: {
      SkinSWF: String,
      SkinColor: Number,
      NoseId: Number,
      EyeId: Number,
      MouthId: Number,
      EyeColors: String,
      MouthColors: String
    },
    Progression: {
      Money: Number,
      Fame: Number,
      Fortune: Number
    },
    Profile: {
      ProfileText: String,
      ProfileDisplays: Array,
      Created: Date,
      LastLogin: Date
    },
    Wishlist: Array,
    Favorites: {
      FavoriteMovie: String,
      FavoriteActor: String,
      FavoriteActress: String,
      FavoriteSinger: String,
      FavoriteSong: String
    },
    Room: {
      RoomActorLikes: Array,
      Wallpaper: String,
      Floor: String
    },
    Autographs: {
      NumberOfAutographsReceived: Number,
      NumberOfAutographsGiven: Number,
      TimeOfLastAutographGiven: Date
    },
    Gifts: {
      ValueOfGiftsReceived: Number,
      ValueOfGiftsGiven: Number
    },
    VIP: {
      MembershipPurchasedDate: Date,
      MembershipTimeoutDate: Date,
      MembershipGiftRecievedDate: Date,
      PurchaseTimeoutDate: Date,
      TotalVipDays: Number
    },
    Extra: {
      IsExtra: Number,
      GiftStatus: Number,
      BadWordCount: Number,
      HasUnreadMessages: Number,
      AwardMoney: Number,
      InvitedByActorId: Number,
      RetentionStatus: Number,
      MarketingNextStepLogins: Number,
      MarketingStep: Number,
      RecyclePoints: Number,
      FacebookId: String
    },
    Mood: {
      FigureAnimation: String,
      FaceAnimation: String,
      MouthAnimation: String,
      TextLine: String
    },
    DiscordId: String
  })
);

exports.ticketModel = model(
  "tickets",
  new Schema({
    ActorId: Number,
    Ticket: String,
    Date: String,
    Disable: Boolean,
    IPId: Number
  })
);

exports.IPModel = model(
  "ips",
  new Schema({
    IPId: Number,
    IP: String,
    Score: Number,
    Warns: Number,
    Locked: Boolean
  })
);

exports.IPCountryModel = model(
  "ips_countries",
  new Schema({
    ip_range_start: Number,
    ip_range_end: Number,
    country_code: String
  })
);

exports.pollModel = model(
  "polls",
  new Schema({
    ActorId: Number,
    PollId: Number,
    Answer: Number
  })
);

exports.friendModel = model(
  "friends",
  new Schema({
    RequesterId: Number,
    ReceiverId: Number,
    Status: Number
  })
);

exports.boyfriendModel = model(
  "boyfriends",
  new Schema({
    RequesterId: Number,
    ReceiverId: Number,
    Status: Number
  })
);

exports.logModel = model(
  "chatlogs",
  new Schema({
    ActorId: Number,
    LogId: Number,
    RoomId: Number,
    Date: Date,
    IPId: Number,
    Message: String
  })
);

exports.behaviorModel = model(
  "behaviors",
  new Schema({
    BehaviorId: Number,
    ActorId: Number,
    HandledByActorId: Number,
    LockedText: String,
    ChatlogId: Number,
    IPId: Number,
    BehaviourStatus: Number,
    HandledOn: Date,
    LockedDays: Number
  })
);

exports.reportModel = model(
  "reports",
  new Schema({
    ReportId: Number,
    ComplainerActorId: Number,
    ReportedActorId: Number,
    MovieId: Number,
    Comment: String,
    State: Number,
    ReportedDate: Date,
    HandledDate: Date,
    Conclusion: String
  })
);

exports.clothModel = model(
  "clothes",
  new Schema({
    ClothesId: Number,
    Name: String,
    SWF: String,
    ClothesCategoryId: Number,
    Price: Number,
    ShopId: Number,
    SkinId: Number,
    Filename: String,
    Scale: Number,
    Vip: Number,
    Sortorder: Number,
    New: Number,
    Discount: Number,
    RegNewUser: Number,
    DiamondsPrice: Number,
    ColorScheme: String,
    ClothesCategoryName: String,
    SlotTypeId: Number,
    IsHidden: Number,
    BuyBy: Array
  })
);

exports.giftModel = model(
  "gifts",
  new Schema({
    GiftId: Number,
    SenderActorId: Number,
    ReceiverActorId: Number,
    ClothesRellId: Number,
    State: Number, // 0 : Not open / 1 : Open
    SWF: String
  })
);

exports.eyeModel = model(
  "eyes",
  new Schema({
    EyeId: Number,
    Name: String,
    SWF: String,
    SkinId: Number,
    Price: Number,
    Vip: Number,
    RegNewUser: Number,
    sortorder: Number,
    Discount: Number,
    DiamondsPrice: Number,
    IsHidden: Number,
    DragonBone: Boolean
  })
);

exports.noseModel = model(
  "noses",
  new Schema({
    NoseId: Number,
    Name: String,
    SWF: String,
    SkinId: Number,
    Price: Number,
    Vip: Number,
    RegNewUser: Number,
    sortorder: Number,
    Discount: Number,
    DiamondsPrice: Number,
    IsHidden: Number,
    DragonBone: Boolean
  })
);

exports.mouthModel = model(
  "mouths",
  new Schema({
    MouthId: Number,
    Name: String,
    SWF: String,
    SkinId: Number,
    Price: Number,
    Vip: Number,
    RegNewUser: Number,
    sortorder: Number,
    Discount: Number,
    DiamondsPrice: Number,
    IsHidden: Number,
    DragonBone: Boolean,
    DefaultColors: String
  })
);

exports.idModel = model(
  "rellids_clothes",
  new Schema({
    ActorId: Number,
    ClothesRellId: Number,
    ClothId: Number,
    Colors: String,
    x: Number,
    y: Number,
    IsWearing: Number,
    IsRecycled: Number
  })
);

exports.clickitemModel = model(
  "clickitems",
  new Schema({
    ClickItemId: Number,
    Name: String,
    MaxStage: Number,
    Description: String,
    Price: Number,
    Vip: Number,
    New: Number,
    Discount: Number,
    SWF: String
  })
);

exports.idclickitemModel = model(
  "rellids_clickitems",
  new Schema({
    ActorClickItemRelId: Number,
    ClickItemId: Number,
    ActorId: Number,
    Name: String,
    Data: String,
    FoodPoints: Number,
    Stage: Number,
    LastFeedTime: Date,
    x: Number,
    y: Number,
    LastWashTime: Date,
    PlayPoints: Number,
    InRoom: Number,
    IsRecycled: Number
  })
);

exports.mailModel = model(
  "mails",
  new Schema({
    MailId: Number,
    FromActorId: Number,
    ToActorId: Number,
    Subject: String,
    Message: String,
    wDate: Date,
    Status: Number
  })
);

exports.movieModel = model(
  "movies",
  new Schema({
    MovieId: Number,
    Name: String,
    ActorId: Number,
    Guid: String,
    State: Number,
    WatchedTotalCount: Number,
    WatchedActorCount: Number,
    RatedCount: Number,
    RatedTotalScore: Number,
    AverageRating: Number,
    CreatedDate: Date,
    PublishedDate: Date,
    StarCoinsEarned: Number,
    MovieData: String,
    Complexity: Number,
    CompetitionDate: Date,
    CompetitionId: Number,
    CompetitionVotes: Array,
    ActorClothesData: String,
    MovieActorRels: Array,
    Scenes: Array,
    ActorWatched: Array
  })
);

exports.newsModel = model(
  "news",
  new Schema({
    NewsId: Number,
    _Date: Date,
    Headline: String,
    Description: String,
    SWF: String
  })
);

exports.competitionModel = model(
  "competitions",
  new Schema({
    MovieCompetitionId: Number,
    Name: String,
    Description: String,
    RequiredText: String,
    StartTime: Date,
    EndTime: Date,
    Prize1: Number,
    Prize2: Number,
    Prize3: Number,
    Prize1VIP: Number,
    Prize2VIP: Number,
    Prize3VIP: Number,
    NewsId: Number
  })
);

exports.animationModel = model(
  "animations",
  new Schema({
    AnimationId: Number,
    Name: String,
    SWF: String,
    CategoryId: Number,
    Price: Number,
    SkinId: Number,
    Filename: String,
    Vip: Number,
    New: Number,
    Discount: Number,
    ThemeId: Number,
    DiamondsPrice: Number,
    AvailableUntil: String,
    ColorScheme: String,
    CategoryName: String,
    SlotTypeId: Number,
    IsHidden: Number,
    BuyBy: Array
  })
);

exports.idAnimationModel = model(
  "rellids_animations",
  new Schema({
    ActorId: Number,
    AnimationRellId: Number,
    AnimationId: Number
  })
);

exports.backgroundModel = model(
  "backgrounds",
  new Schema({
    BackgroundId: Number,
    Name: String,
    SWF: String,
    CategoryId: Number,
    Price: Number,
    SkinId: Number,
    Filename: String,
    Vip: Number,
    New: Number,
    Discount: Number,
    ThemeId: Number,
    DiamondsPrice: Number,
    AvailableUntil: String,
    ColorScheme: String,
    CategoryName: String,
    SlotTypeId: Number,
    IsHidden: Number,
    BuyBy: Array
  })
);

exports.idBackgroundModel = model(
  "rellids_backgrounds",
  new Schema({
    ActorId: Number,
    BackgroundRellId: Number,
    BackgroundId: Number
  })
);

exports.musicModel = model(
  "musics",
  new Schema({
    MusicId: Number,
    Name: String,
    Url: String,
    MusicCategoryId: Number,
    Price: Number,
    Level: Number,
    Vip: Number,
    New: Number,
    Discount: Number,
    CategoryName: String,
    IsHidden: Number,
    BuyBy: Array
  })
);

exports.idMusicModel = model(
  "rellids_musics",
  new Schema({
    ActorId: Number,
    MusicRellId: Number,
    MusicId: Number
  })
);

exports.lookModel = model(
  "looks",
  new Schema({
    LookId: Number,
    ActorId: Number,
    Created: Date,
    State: Number,
    Headline: String,
    LookData: String,
    Likes: Array,
    Sells: Array
  })
);

exports.forumModel = model(
  "forums",
  new Schema({
    ForumId: Number,
    Name: String
  })
);

exports.topicModel = model(
  "topics",
  new Schema({
    TopicId: Number,
    ForumId: Number,
    Subject: String,
    ActorId: Number,
    PostDate: Date,
    IsDeleted: Number
  })
);

exports.postModel = model(
  "posts",
  new Schema({
    PostId: Number,
    TopicId: Number,
    ForumId: Number,
    ActorId: Number,
    Message: String,
    PostDate: Date,
    IsDeleted: Number
  })
);

exports.activityModel = model(
  "activities",
  new Schema({
    ActivityId: Number,
    ActorId: Number,
    Type: Number,
    _Date: Date,
    MovieId: Number,
    FriendId: Number,
    ContestId: Number,
    LookId: Number
  })
);

exports.todoModel = model(
  "todos",
  new Schema({
    TodoId: Number,
    ActorId: Number,
    Type: Number,
    Deadline: String,
    FriendId: Number,
    MovieId: Number,
    ContestId: Number,
    MovieCompetitionId: Number,
    GiftId: Number
  })
);
exports.commentMovieModel = model(
  "comments_movies",
  new Schema({
    RateMovieId: Number,
    MovieId: Number,
    ActorId: Number,
    Score: Number,
    Comment: String,
    RateDate: Date
  })
);

exports.commentEntityModel = model(
  "comments_entities",
  new Schema({
    EntityCommentId: Number,
    EntityType: Number,
    EntityId: Number,
    ActorId: Number,
    Created: Date,
    Comment: String,
    IsDeleted: Number
  })
);

exports.guestbookModel = model(
  "guestbooks",
  new Schema({
    GuestbookEntryId: Number,
    AuthorActorId: Number,
    IsDeleted: Number,
    DateCreated: Date,
    GuestbookActorId: Number,
    Body: String
  })
);

exports.transactionModel = model(
  "transactions",
  new Schema({
    TransactionId: Number,
    StripeId: String,
    CheckoutDone: Number,
    ActorId: Number,
    Amount: Number,
    Currency: String,
    MobileNumber: String,
    Timestamp: Date,
    StarCoinsBefore: Number,
    StarCoinsAfter: Number,
    result_code: Number,
    content_id: String,
    CardNumber: String
  })
);

exports.confModel = model(
  "configs",
  new Schema({
    PollId: Number,
    Question: String,
    Answer1: String,
    Answer2: String,
    Answer3: String,
    Answer4: String,
    ActorId: Number,
    LastPolls: Array
  })
);