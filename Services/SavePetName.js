const { idclickitemModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "SavePetName",
	needTicket: true,
	levelModerator: 0
};

exports.run = async (request, ActorId) => {
	await idclickitemModel.updateOne(
		{
			ActorId: ActorId,
			ActorClickItemRelId: request.actorClickItemRelId,
			IsRecycled: 0
		},
		{
			Name: request.name
		}
	);

	return buildXML("SavePetName");
};
