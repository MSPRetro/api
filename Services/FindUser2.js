const { userModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "FindUser2",
	needTicket: true,
	levelModerator: 0
};

exports.run = async request => {
	const username = request.searchString.toString().trim();

	const users = await userModel
		.find({ Name: { $regex: new RegExp(`^${username}`, "i") } })
		.skip(request.pageindex * 10)
		.limit(10)
		.collation({ locale: "en", strength: 2 });

	let ActorName = [];

	for (let user of users)
		ActorName.push({ ActorId: user.ActorId, Name: user.Name });

	return buildXML("FindUser2", {
		totalRecords: await userModel.countDocuments({
			Name: { $regex: new RegExp(`^${username}`, "i") }
		}),
		pageindex: request.pageindex,
		pagesize: 10,
		items: {
			ActorName: ActorName
		}
	});
};
