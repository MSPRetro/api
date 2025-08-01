const { setError } = require("./ErrorManager.js");
const {
	userModel,
	behaviorModel,
	giftModel,
	confModel,
	pollModel,
	friendModel,
	boyfriendModel,
	activityModel,
	todoModel,
	collectionIdModel
} = require("./Schemas.js");
const { getValue } = require("./Globals.js");

const sanitizeJSON = (exports.sanitizeJSON = v => {
	if (v instanceof Object) {
		for (let key in v) {
			if (/^\$/.test(key)) delete v[key];
			else sanitizeJSON(v[key]);
		}
	}

	return v;
});

exports.numStr = (a, b) => {
	a = "" + a;
	b = b || " ";
	let c = "",
		d = 0;
	while (a.match(/^0[0-9]/)) a = a.substr(1);

	for (let i = a.length - 1; i >= 0; i--) {
		c = d != 0 && d % 3 == 0 ? a[i] + b + c : a[i] + c;
		d++;
	}
	return c;
};

const formatDate = (exports.formatDate = (
	datetime,
	shouldAddZ = false,
	shouldAddT = false
) => {
	if (typeof datetime === "string") datetime = new Date(Date.parse(datetime));
	let z = "";
	let t = "T";
	if (shouldAddZ) {
		z = "Z";
		t = " ";
	}
	if (shouldAddZ && shouldAddT) {
		z = "Z";
		t = "T";
	}

	let month = datetime.getMonth() + 1;
	if (month.toString().length == 1) month = "0" + month;

	let day = datetime.getDate();
	if (day.toString().length == 1) day = "0" + day;

	let hour = datetime.getHours();
	if (hour.toString().length == 1) hour = "0" + hour;

	let minutes = datetime.getMinutes();
	if (minutes.toString().length == 1) minutes = "0" + minutes;

	let seconds = datetime.getSeconds();
	if (seconds.toString().length == 1) seconds = "0" + seconds;

	return `${datetime.getFullYear()}-${month}-${day}${t}${hour}:${minutes}:${seconds}${z}`;
});

let addDays = (exports.addDays = (dateObj, numDays) => {
	dateObj.setDate(dateObj.getDate() + numDays);
	return dateObj;
});

exports.addMinutes = (dateObj, numMinutes) => {
	dateObj.setMinutes(dateObj.getMinutes() + numMinutes);
	return dateObj;
};

exports.buildPage = (pageIndex, pageSize, array) => {
	pageIndex++;
	return array.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
};

const buildLevel = (exports.buildLevel = fames => {
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

	let r = -1;
	for (const [key, value] of Object.entries(levels)) {
		if (key > fames) {
			r = value - 1;
			break;
		}
	}
	if (r == -1) r = 20;
	return r;
});

exports.isModerator = async (ActorId, user = null, level) => {
	if (!user) user = await userModel.findOne({ ActorId: ActorId });

	if (level != 0 && level <= user.LevelModerator) return true;
	else {
		if (user.LevelModerator == -1) {
			setError(
				`Your moderator permissions haven't been approved yet, please contact a game Administrator.`,
				true,
				{ moderator: true }
			);
			return false;
		}

		setError(
			`You do not have the necessary rights to do this action.\n\n[Your moderator level]: ${user.LevelModerator}\n[Required moderator level]: ${level}`,
			true,
			{ moderator: true }
		);

		return false;
	}
};

const isVip = (exports.isVip = async (ActorId, user = null) => {
	if (!user) user = await userModel.findOne({ ActorId: ActorId });

	if (Date.now() > user.VIP.MembershipTimeoutDate) return false;
	else return true;
});

const friendVIPCount = (exports.friendVIPCount = async ActorId => {
	let friends = await friendModel.aggregate([
		{
			$match: {
				$or: [
					{ RequesterId: ActorId, Status: 1 },
					{ ReceiverId: ActorId, Status: 1 }
				]
			}
		},
		{
			$group: {
				_id: null,
				intArray: {
					$push: {
						$cond: [
							{ $eq: ["$RequesterId", ActorId] },
							"$ReceiverId",
							"$RequesterId"
						]
					}
				}
			}
		},
		{
			$project: {
				_id: 0,
				intArray: 1
			}
		}
	]);

	friends = friends[0];
	if (!friends) return 0;

	return (
		(await userModel.countDocuments({
			ActorId: { $in: friends.intArray },
			"VIP.MembershipTimeoutDate": { $gte: new Date() }
		})) + 1
	);
});

exports.addFame = async (ActorId, user = null, fames, fromAutographOrMovie) => {
	if (fromAutographOrMovie) {
		if (await isVip(ActorId, user))
			fames = Math.round(fames + (fames * 25) / 100);
		if ((await friendVIPCount(ActorId)) >= 100)
			fames = Math.round(fames + (fames * 10) / 100);
	}

	return await userModel.findOneAndUpdate(
		{ ActorId: ActorId },
		{ $inc: { "Progression.Fame": fames } },
		{ new: true }
	);
};

exports.addOrRemoveMoney = async (ActorId, amount, updateFortune) => {
	if (updateFortune) {
		return await userModel.findOneAndUpdate(
			{ ActorId: ActorId },
			{
				$inc: {
					"Progression.Money": amount,
					"Progression.Fortune": amount
				}
			},
			{ new: true }
		);
	}

	return await userModel.findOneAndUpdate(
		{ ActorId: ActorId },
		{ $inc: { "Progression.Money": amount } },
		{ new: true }
	);
};

const getNewId = (exports.getNewId = async sequence_name => {
	const q = await collectionIdModel.findOneAndUpdate(
		{ _id: sequence_name },
		{ $inc: { sequence_value: 1 } },
		{ new: true }
	);

	return q.sequence_value;
});

exports.createActivity = async (
	ActorId,
	Type,
	MovieId,
	FriendId,
	ContestId,
	LookId
) => {
	if ([3, 4, 5, 7].includes(Type))
		await activityModel.updateMany(
			{ ActorId: ActorId, Type: Type },
			{ ActorId: 0 }
		);

	let ActivityId = (await getNewId("activity_id")) + 1;

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

let createTodo = (exports.createTodo = async (
	ActorId,
	Type,
	Deadline = new Date(0),
	MovieId,
	FriendId,
	ContestId,
	MovieCompetitionId,
	GiftId
) => {
	// if ([ 3, 4, 5, 7 ].includes(Type)) await activityModel.updateMany({ ActorId: ActorId, Type: Type }, { ActorId: 0 });

	let TodoId = (await getNewId("todo_id")) + 1;

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
});

exports.getActorDetails = async (ActorId, RellActorId, Password) => {
	let user = await userModel.findOne({ ActorId: ActorId });
	if (!user) return {};

	const behavior = await behaviorModel
		.findOne({ ActorId: ActorId, BehaviourStatus: 1 })
		.sort({ _id: -1 });

	let BehaviourStatus;
	let LockedUntil;
	let LockedText = "";

	if (!behavior) {
		BehaviourStatus = 2;
		LockedUntil = formatDate(new Date(0), true, true);
	} else {
		BehaviourStatus = behavior.BehaviourStatus;

		LockedUntil = formatDate(
			addDays(behavior.HandledOn, behavior.LockedDays),
			true,
			true
		);
		LockedText = behavior.LockedText;
	}

	let password = "";
	let email = "";

	if (ActorId == RellActorId) {
		if (
			getValue(`${RellActorId}-LEVEL`) !=
				buildLevel(user.Progression.Fame) &&
			buildLevel(user.Progression.Fame) == 3 &&
			user.Extra.InvitedByActorId != 0
		) {
			await createTodo(
				RellActorId,
				false,
				4,
				0,
				user.Extra.InvitedByActorId,
				0,
				0
			);
		}

		//email = user.Email.EmailValidated == 2 ? user.Email.Email : "0.0";
		password = Password;
	}

	let config = await confModel.find({});
	config = config[0];

	let PollTaken = 1;
	if (await pollModel.findOne({ ActorId: ActorId, PollId: config.PollId }))
		PollTaken = 1;
	else PollTaken = 0;

	let RoomActorLike = {};

	if (user.Room.RoomActorLikes.includes(RellActorId))
		RoomActorLike = {
			RoomActorLike: {
				EntityType: 2,
				EntityId: ActorId,
				ActorId: RellActorId
			}
		};

	const FriendCount =
		(await friendModel.countDocuments({
			$or: [{ RequesterId: user.ActorId }, { ReceiverId: user.ActorId }],
			Status: 1
		})) + 1;

	let BoyfriendId;
	let BoyfriendStatus;
	let BoyFriend;

	const boyfriend = await boyfriendModel.findOne({
		$or: [
			// { RequesterId: ActorId, Status: 1 },
			// { ReceiverId: ActorId, Status: 1 },
			{ RequesterId: ActorId, Status: 2 },
			{ ReceiverId: ActorId, Status: 2 }
		]
	});

	if (!boyfriend) {
		BoyFriend = {};
		BoyfriendId = 0;
		BoyfriendStatus = 0;
	} else {
		const boyfriendUser = await userModel.findOne({
			ActorId:
				ActorId == boyfriend.RequesterId
					? boyfriend.ReceiverId
					: boyfriend.RequesterId
		});

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
		Email: "0.0", // usually its the email variable instead of 0.0
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
		NumberOfGiftsGiven: await giftModel.countDocuments({
			SenderActorId: ActorId
		}),
		NumberOfGiftsReceived: await giftModel.countDocuments({
			ReceiverActorId: ActorId
		}),
		NumberOfAutographsReceived: user.Autographs.NumberOfAutographsReceived,
		NumberOfAutographsGiven: user.Autographs.NumberOfAutographsGiven,
		TimeOfLastAutographGiven: formatDate(
			user.Autographs.TimeOfLastAutographGiven,
			true
		),
		FacebookId: user.Extra.FacebookId,
		BoyfriendId: BoyfriendId,
		BoyfriendStatus: BoyfriendStatus,
		MembershipPurchasedDate: formatDate(user.VIP.MembershipPurchasedDate),
		MembershipTimeoutDate: formatDate(user.VIP.MembershipTimeoutDate),
		MembershipGiftRecievedDate: formatDate(
			user.VIP.MembershipGiftRecievedDate
		), // formatDate(addDays(new Date(), -1)), // formatDate(user.VIP.MembershipGiftRecievedDateNoVIP, true),
		BehaviourStatus: BehaviourStatus,
		LockedUntil: LockedUntil,
		LockedText: LockedText,
		BadWordCount: user.Extra.BadWordCount,
		PurchaseTimeoutDate: formatDate(new Date()),
		EmailValidated: 2,
		RetentionStatus: user.Extra.RetentionStatus,
		GiftStatus: 2, // user.Gifts.GiftStatus, If is set to 1, user can see the present given but the devs (Call action UpdateGift)
		MarketingNextStepLogins: user.Extra.MarketingNextStepLogins,
		MarketingStep: user.Extra.MarketingStep,
		TotalVipDays: user.VIP.TotalVipDays,
		RecyclePoints: user.Extra.RecyclePoints,
		EmailSettings: user.Email.EmailSettings,
		RoomLikes: user.Room.RoomActorLikes.length,
		TimeOfLastAutographGivenStr: formatDate(
			user.Autographs.TimeOfLastAutographGiven,
			true
		),
		BoyFriend: BoyFriend,
		RoomActorLikes: RoomActorLike
	};
};

exports.getProductByKey = key => {
	switch (key) {
		case "1000":
		case "2000": // 1 week VIP
			return {
				amountVIPDays: 8,
				amountStarCoins: 1000,
				description: "1 week VIP + 1.000 StarCoins"
			};

		case "3000": // 1 month VIP
			return {
				amountVIPDays: 31,
				amountStarCoins: 5000,
				description: "1 month VIP + 5.000 StarCoins"
			};

		case "6000": // 1 year VIP
			return {
				amountVIPDays: 366,
				amountStarCoins: 100000,
				description: "1 year VIP + 100.000 StarCoins"
			};

		case "14000": // 3 months VIP
			return {
				amountVIPDays: 91,
				amountStarCoins: 20000,
				description: "3 months VIP + 20.000 StarCoins"
			};

		case "2001": // $10.000 StarCoins
			return {
				amountVIPDays: 0,
				amountStarCoins: 10000,
				description: "10.000 StarCoins"
			};

		case "3001": // $50.000 StarCoins
			return {
				amountVIPDays: 0,
				amountStarCoins: 50000,
				description: "50.000 StarCoins"
			};

		case "6001": // $400.000 StarCoins
			return {
				amountVIPDays: 0,
				amountStarCoins: 400000,
				description: "400.000 StarCoins"
			};

		case "14001": // $1.000.000 StarCoins
			return {
				amountVIPDays: 0,
				amountStarCoins: 1000000,
				description: "1.000.000 StarCoins"
			};
	}
};

exports.getCurrencySymbol = currency => {
	switch (currency) {
		default:
		case "EUR":
			return {
				currency: "EUR",
				symbol: "€",
				orientation: "R",
				paymentMethods: ["card", "klarna", "ideal", "sofort", "eps"]
			};
		case "PLN":
			return {
				currency: "PLN",
				symbol: "zł",
				orientation: "R",
				paymentMethods: ["card", "klarna", "p24", "blik"]
			};
		case "GBP":
			return {
				currency: "GBP",
				symbol: "£",
				orientation: "L",
				paymentMethods: ["card", "klarna"]
			};
		case "TRY":
			return {
				currency: "TRY",
				symbol: "TLY",
				orientation: "R",
				paymentMethods: ["card"]
			};
		case "USD":
			return {
				currency: "USD",
				symbol: "$US",
				orientation: "L",
				paymentMethods: ["card"]
			};
		case "AUD":
			return {
				currency: "AUD",
				symbol: "$AU",
				orientation: "L",
				paymentMethods: ["card"]
			};
		case "DKK":
			return {
				currency: "DKK",
				symbol: "kr.",
				orientation: "L",
				paymentMethods: ["card", "klarna"]
			};
		case "CAD":
			return {
				currency: "CAD",
				symbol: "$CA",
				orientation: "L",
				paymentMethods: ["card"]
			};
		case "NOK":
			return {
				currency: "NOK",
				symbol: "kr",
				orientation: "L",
				paymentMethods: ["card", "klarna"]
			};
		case "SEK":
			return {
				currency: "SEK",
				symbol: "kr",
				orientation: "R",
				paymentMethods: ["card", "klarna"]
			};
		case "NZD":
			return {
				currency: "NZD",
				symbol: "$NZ",
				orientation: "L",
				paymentMethods: ["card"]
			};
	}
};
