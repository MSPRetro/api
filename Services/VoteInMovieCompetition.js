const { movieModel, userModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "VoteInMovieCompetition",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  if (await movieModel.findOne({ CompetitionId: request.movieCompetitionId, CompetitionVotes: { in: [ ActorId ] } })) return;
  
  const user = await userModel.findOne({ ActorId: ActorId });
  let votes; 
  
  if (user.VIP.TotalVipDays >= 180) votes = { $each: [ ActorId, ActorId ] };
  else if (user.VIP.TotalVipDays >= 90) votes = ActorId;
  else return;
  
  await movieModel.updateOne({
    MovieId: request.movieId,
    CompetitionId: request.movieCompetitionId
  }, {
    $push: {
      CompetitionVotes: votes
    }
  });
  
  return buildXML("VoteInMovieCompetition");
}