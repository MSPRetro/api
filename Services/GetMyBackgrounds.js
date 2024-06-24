const { buildXML } = require("../Utils/XML.js");
const { idBackgroundModel, backgroundModel } = require("../Utils/Schemas.js");

exports.data = {
	SOAPAction: "GetMyBackgrounds",
	needTicket: false,
	levelModerator: 0
};

exports.run = async request => {
	const backgrounds = await idBackgroundModel.find({
		ActorId: request.actorId
	});

	let backgroundsArr = [];

	for (let backgroundActor of backgrounds) {
		const background = await backgroundModel.findOne({
			BackgroundId: backgroundActor.BackgroundId
		});

		backgroundsArr.push({
			ActorBackgroundRelId: backgroundActor.BackgroundRellId,
			ActorId: request.actorId,
			BackgroundId: background.BackgroundId,
			Background: {
				BackgroundId: background.BackgroundId,
				Name: background.Name,
				BackgroundCategoryId: background.CategoryId,
				Price: background.Price,
				Level: 0,
				url: background.Filename,
				Vip: background.Vip,
				Deleted: 0,
				New: 0,
				Discount: background.Discount,
				BackgroundCategory: {
					BackgroundCategoryId: background.CategoryId,
					Name: background.CategoryName
				}
			}
		});
	}

	return buildXML("GetMyBackgrounds", {
		ActorBackgroundRel: backgroundsArr
	});
};
