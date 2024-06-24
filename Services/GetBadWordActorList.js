const { userModel } = require("../Utils/Schemas.js");
const { getActorDetails } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "GetBadWordActorList",
	needTicket: true,
	levelModerator: 1
};

exports.run = async (request, ActorId, IP, Password) => {
	const users = await userModel
		.find({ "Extra.BadWordCount": { $ne: 0 } })
		.sort({ "Extra.BadWordCount": -1 })
		.skip(request.pageindex * 10)
		.limit(10);

	let userData = [];

	for (let user of users) {
		userData.push(await getActorDetails(user.ActorId, ActorId, Password));
	}

	return buildXML("GetBadWordActorList", {
		totalRecords: await userModel.countDocuments({
			"Extra.BadWordCount": { $ne: 0 }
		}),
		pageindex: request.pageindex,
		pagesize: 10,
		items: {
			ActorDetails: userData
		}
	});
};
