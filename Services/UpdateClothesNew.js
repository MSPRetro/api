const { idModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "UpdateClothesNew",
	needTicket: true,
	levelModerator: 0
};

exports.run = async (request, ActorId) => {
	await idModel.updateMany(
		{ ActorId: ActorId, IsWearing: 1 },
		{ IsWearing: 0 }
	);

	if (typeof request.newWearingItems === "number")
		return buildXML("UpdateClothesNew");
	if (
		request.newWearingItems.ActorClothesRel2.ActorClothesRelId !== undefined
	) {
		const item = await idModel.findOne({
			ActorId: ActorId,
			ClothesRellId:
				request.newWearingItems.ActorClothesRel2.ActorClothesRelId
		});
		if (!item) return;

		await idModel.updateOne(
			{
				ClothesRellId:
					request.newWearingItems.ActorClothesRel2.ActorClothesRelId
			},
			{ IsWearing: 1 }
		);

		return buildXML("UpdateClothesNew");
	}

	for (let cloth of request.newWearingItems.ActorClothesRel2) {
		const item = await idModel.findOne({
			ActorId: ActorId,
			ClothesRellId: cloth.ActorClothesRelId
		});
		if (!item) continue;

		await idModel.updateOne(
			{ ClothesRellId: cloth.ActorClothesRelId },
			{ IsWearing: 1 }
		);
	}

	return buildXML("UpdateClothesNew");
};
