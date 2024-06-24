const { movieModel } = require("../Utils/Schemas.js");
const { createActivity } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "PublishMovie",
	needTicket: true,
	levelModerator: 0
};

exports.run = async (request, ActorId) => {
	const movie = await movieModel.findOne({
		ActorId: ActorId,
		Guid: request.movieGuid
	});
	if (!movie) return;

	await movieModel.updateOne(
		{ ActorId: ActorId, Guid: request.movieGuid },
		{
			State: 100,
			PublishedDate: new Date()
		}
	);

	await createActivity(ActorId, 1, movie.MovieId, 0, 0, 0);

	return buildXML("PublishMovie");
};
