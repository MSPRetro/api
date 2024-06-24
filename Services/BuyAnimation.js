const {
	userModel,
	idAnimationModel,
	animationModel
} = require("../Utils/Schemas.js");
const {
	getActorDetails,
	isVip,
	isModerator,
	addOrRemoveMoney,
	addFame,
	getNewId
} = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "BuyAnimation",
	needTicket: true,
	levelModerator: 0
};

exports.run = async (request, ActorId, IP, Password) => {
	const animation = await animationModel.findOne({
		AnimationId: request.animation.AnimationId
	});

	const user = await userModel.findOne({ ActorId: ActorId });

	let Price;

	if (animation.Discount != 0) Price = animation.Discount;
	else Price = animation.Price;

	if (
		!animation ||
		(!(await isModerator(ActorId, user, 3)) && animation.IsHidden == 1) ||
		Price > user.Progression.Money
	)
		return;
	if (animation.Vip != 0 && !(await isVip(ActorId, user)));
	if (
		await idAnimationModel.findOne({
			ActorId: ActorId,
			AnimationId: animation.AnimationId
		})
	)
		return;

	let RellId = (await getNewId("rell_animation_id")) + 1;

	await addOrRemoveMoney(ActorId, -Price);
	await addFame(ActorId, user, Price / 10);

	await animationModel.updateOne(
		{ AnimationId: animation.AnimationId },
		{ $push: { BuyBy: ActorId } }
	);

	const item = new idAnimationModel({
		ActorId: ActorId,
		AnimationRellId: RellId,
		AnimationId: animation.AnimationId
	});
	await item.save();

	return buildXML(
		"BuyAnimation",
		await getActorDetails(ActorId, ActorId, Password)
	);
};
