const { backgroundModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "GetBackgrounds",
	needTicket: true,
	levelModerator: 0
};

exports.run = async () => {
	const backgrounds = await backgroundModel
		.find({ IsHidden: 0 })
		.sort({ _id: -1 });

	let backgroundsArr = [];

	for (let background of backgrounds) {
		backgroundsArr.push({
			BackgroundId: background.BackgroundId,
			Name: background.Name,
			BackgroundCategoryId: background.CategoryId,
			Price: background.Price,
			Level: 0,
			url: background.Filename,
			Vip: background.Vip,
			Deleted: background.IsHidden,
			New: background.New,
			Discount: background.Discount,
			BackgroundCategory: {
				BackgroundCategoryId: background.CategoryId,
				Name: background.CategoryName
			}
		});
	}

	return buildXML("GetBackgrounds", {
		Background: backgroundsArr
	});
};
