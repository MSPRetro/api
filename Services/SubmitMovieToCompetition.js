const { competitionModel, movieModel } = require("../Utils/Schemas.js");
const { formatDate } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "SubmitMovieToCompetition",
	needTicket: true,
	levelModerator: 0
};

exports.run = async (request, ActorId) => {
	const competition = await competitionModel.findOne({
		MovieCompetitionId: request.movieCompetitionId
	});
	if (!competition) return;

	await movieModel.updateOne(
		{ MovieId: request.movieId, ActorId: ActorId, State: 100 },
		{
			CompetitionDate: new Date(),
			CompetitionId: competition.MovieCompetitionId
		}
	);

	return buildXML("SubmitMovieToCompetition");
};
