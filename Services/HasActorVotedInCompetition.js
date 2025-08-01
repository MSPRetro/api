const { movieModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "HasActorVotedInCompetition",
	needTicket: true,
	levelModerator: 0
};

exports.run = async (request, ActorId) => {
	if (
		await movieModel.findOne({
			CompetitionId: request.movieCompetitionId,
			CompetitionVotes: { $in: [ActorId] }
		})
	)
		return buildXML("HasActorVotedInCompetition", true);
	else return buildXML("HasActorVotedInCompetition", false);
};
