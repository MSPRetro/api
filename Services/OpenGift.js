const {
	giftModel,
	idModel,
	clothModel,
	todoModel,
	userModel
} = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "OpenGift",
	needTicket: true,
	levelModerator: 0
};

exports.run = async (request, ActorId) => {
	const gift = await giftModel.findOne({
		GiftId: request.giftId,
		ReceiverActorId: ActorId,
		State: 0
	});
	if (!gift) return;

	await giftModel.updateOne(
		{ GiftId: request.giftId, ReceiverActorId: ActorId, State: 0 },
		{
			State: 1
		}
	);

	await idModel.updateOne(
		{ ClothesRellId: gift.ClothesRellId },
		{
			ActorId: ActorId
		}
	);

	const relCloth = await idModel.findOne({
		ClothesRellId: gift.ClothesRellId
	});
	const cloth = await clothModel.findOne({ ClothesId: relCloth.ClothId });

	if (!(await giftModel.find({ ReceiverActorId: ActorId, State: 0 }))) {
		await todoModel.updateOne(
			{ FriendId: ActorId, Type: 8 },
			{ ActorId: 0, FriendId: 0 }
		);
	}

	await userModel.updateOne(
		{ ActorId: ActorId },
		{
			$inc: {
				"Gifts.ValueOfGiftsReceived": cloth.Price
			}
		}
	);

	return buildXML("OpenGift", {
		ActorClothesRelId: gift.ClothesRellId,
		ActorId: ActorId,
		ClothesId: relCloth.ClothId,
		Color: relCloth.Colors,
		IsWearing: relCloth.IsWearing,
		x: 0,
		y: 0,
		Cloth: {
			ClothesId: relCloth.ClothId,
			Name: cloth.Name,
			SWF: cloth.SWF,
			ClothesCategoryId: cloth.ClothesCategoryId,
			Price: cloth.Price,
			ShopId: cloth.ShopId,
			SkinId: cloth.SkinId,
			Filename: cloth.Filename,
			Scale: cloth.Scale,
			Vip: cloth.Vip,
			RegNewUser: cloth.RegNewUser,
			sortorder: cloth.Sortorder,
			New: cloth.New,
			Discount: cloth.Discount,
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
