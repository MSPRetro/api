const {
	userModel,
	giftModel,
	idModel,
	clothModel
} = require("../Utils/Schemas.js");
const {
	addMinutes,
	formatDate,
	buildLevel,
	createTodo,
	addOrRemoveMoney,
	addFame,
	getNewId
} = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "BuyGift",
	needTicket: true,
	levelModerator: 0
};

exports.run = async (request, ActorId) => {
	if (request.receiverActorId == ActorId) return;

	const user = await userModel.findOne({ ActorId: request.receiverActorId });
	const giver = await userModel.findOne({ ActorId: ActorId });

	const relCloth = await idModel.findOne({
		ClothesRellId: request.giftId,
		IsWearing: 0
	});

	if (
		![
			"Gift_item_1.swf",
			"Gift_item_2.swf",
			"Gift_item_3.swf",
			"Gift_item_4.swf",
			"Gift_item_5.swf",
			"Gift_item_6.swf"
		].includes(request.swf) ||
		!user ||
		!relCloth ||
		buildLevel(giver.Progression.Fame) < 3
	)
		return;

	const clothe = await clothModel.findOne({ ClothesId: relCloth.ClothId });

	if (clothe.Price > giver.Progression.Money) return;

	await addOrRemoveMoney(ActorId, -clothe.Price);
	await addFame(ActorId, giver, clothe.Price / 10);

	let GiftId = (await getNewId("gift_id")) + 1;

	const gift = new giftModel({
		GiftId: GiftId,
		SenderActorId: ActorId,
		ReceiverActorId: user.ActorId,
		ClothesRellId: relCloth.ClothesRellId,
		State: 0,
		SWF: request.swf
	});
	await gift.save();

	await userModel.updateOne(
		{ ActorId: ActorId },
		{
			$inc: {
				"Gifts.ValueOfGiftsGiven": clothe.Price
			}
		}
	);

	await userModel.updateOne(
		{ ActorId: user.ActorId },
		{
			$pull: {
				Wishlist: relCloth.ClothesRellId
			}
		}
	);

	await createTodo(
		ActorId,
		8,
		false,
		0,
		request.receiverActorId,
		0,
		0,
		GiftId
	);

	return buildXML("BuyGift");
};
