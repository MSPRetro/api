const { animationModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "GetAnimations",
	needTicket: true,
	levelModerator: 0
};

exports.run = async () => {
	const animations = await animationModel
		.find({ IsHidden: 0 })
		.sort({ _id: -1 });

	let animationsArr = [];

	for (let animation of animations) {
		animationsArr.push({
			AnimationId: animation.AnimationId,
			Name: animation.Name,
			FrameLabel: animation.Filename,
			AnimationCategoryId: animation.CategoryId,
			LevelId: 0,
			Price: animation.Price,
			Vip: animation.Vip,
			Deleted: animation.IsHidden,
			New: animation.New,
			Discount: animation.Discount,
			AnimationCategory: {
				AnimationCategoryId: animation.CategoryId,
				Name: animation.CategoryName
			}
		});
	}

	return buildXML("GetAnimations", {
		Animation: animationsArr
	});
};
