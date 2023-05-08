const { movieModel, activityModel, todoModel } = require("../Utils/Schemas.js");
const { buildXML, isModerator } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "DeleteMovie",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  const movie = await movieModel.findOne({ MovieId: request.movieId });
  if (!movie) return;
  
  if (movie.ActorId != ActorId && !await isModerator(ActorId, false, 1)) return;
  
  await movieModel.updateOne({ MovieId: request.movieId }, {
    State: 5
  });
  
  await activityModel.updateOne({ Friend: ActorId, MovieId: request.movieId }, { ActorId: 0, FriendId: 0 });
  await todoModel.updateOne({ FriendId: ActorId, MovieId: request.movieId }, { ActorId: 0, FriendId: 0 });
    
  return buildXML("DeleteMovie");
};
