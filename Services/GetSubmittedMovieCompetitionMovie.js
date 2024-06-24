const { movieModel, userModel } = require("../Utils/Schemas.js");
const { formatDate } = require("../Utils/Util.js");
const { buildXML, buildXMLnull } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "GetSubmittedMovieCompetitionMovie",
	needTicket: false,
	levelModerator: 0
};

exports.run = async request => {
	const movie = await movieModel.findOne({
		CompetitionId: request.movieCompetitionId,
		ActorId: request.actorId
	});
	if (!movie) return buildXMLnull("GetSubmittedMovieCompetitionMovie");

	const user = await userModel.findOne({ ActorId: movie.ActorId });

	return buildXML("GetSubmittedMovieCompetitionMovie", {
		MovieId: movie.MovieId,
		Name: movie.Name,
		ActorId: movie.ActorId,
		State: movie.State,
		WatchedTotalCount: movie.ActorWatched.length,
		WatchedActorCount: movie.ActorWatched.length,
		RatedCount: movie.RatedCount,
		RatedTotalScore: movie.RatedTotalScore,
		CreatedDate: formatDate(movie.CreatedDate),
		PublishedDate: formatDate(movie.PublishedDate),
		AverageRating: movie.AverageRating,
		StarCoinsEarned: movie.StarCoinsEarned,
		Complexity: movie.Complexity,
		competitiondate: formatDate(movie.CompetitionDate),
		MovieCompetitionActor: {
			ActorId: user.ActorId,
			Name: user.Name
		}
	});
};
