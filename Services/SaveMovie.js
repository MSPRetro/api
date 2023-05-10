const { join } = require("path");
const { createReadStream } = require("fs");
const { containerClient } = require("../mspretro.js");
const { movieModel } = require("../Utils/Schemas.js");
const { buildXML, formatDate, createTodo, getNewId } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "SaveMovie",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  for (let i in request.movie) {
    if (isNaN(request.movie[i] && typeof request.movie[i] !== "string")) request.movie[i] = "";
  };
  
  if (request.movie.MovieId != 0) {
    const movie = await movieModel.findOne({ MovieId: request.movie.MovieId, ActorId: ActorId, Status: 0 });
    if (!movie) return;
    
    await movieModel.updateOne({ MovieId: request.movie.MovieId }, {
      Name: request.movie.Name,
      MovieData: request.movie.MovieData,
      ActorClothesData: request.movie.ActorClothesData,
      MovieActorRels: request.movie.MovieActorRels.MovieActorRel,
      Scenes: request.movie.Scenes
    });
    
    return buildXML("SaveMovie", request.movie.MovieId);
    
  } else {
    const MovieId = await getNewId("movie_id") + 1;
    const shardDir = Math.floor(MovieId / 10000);
    
    const stream = createReadStream(join(__dirname, "../DefaultAssets/movie.jpg"));
    
    const file = containerClient.getBlockBlobClient(`/movie-snapshots/${shardDir}/${MovieId}.jpg`);
    await file.uploadStream(stream);
        
    const movie = new movieModel({
      MovieId: MovieId,
      Name: request.movie.Name,
      ActorId: ActorId,
      Guid: request.movie.Guid,
      State: request.movie.State,
      WatchedTotalCount: 0,
      WatchedActorCount: 0,
      RatedCount: 0,
      RatedTotalScore: 0,
      CreatedDate: new Date(),
      PublishedDate: new Date(0),
      AverageRating: 0,
      StarCoinsEarned: 0,
      MovieData: request.movie.MovieData,
      Complexity: request.movie.Complexity,
      CompetitionDate: new Date(0),
      CompetitionId: 0,
      CompetitionVotes: [ ],
      ActorClothesData: request.movie.ActorClothesData,
      MovieActorRels: request.movie.MovieActorRels.MovieActorRel,
      Scenes: request.movie.Scenes,
      ActorWatched: [ ]
    });
    await movie.save();
    
    await createTodo(ActorId, 0, false, MovieId, ActorId, 0, 0, 0);
    
    return buildXML("SaveMovie", MovieId);
  };
};
