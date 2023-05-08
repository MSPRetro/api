const { competitionModel, movieModel, userModel } = require("../Utils/Schemas.js");
const { buildXML, buildXMLnull, formatDate, addDays } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetMovieCompetitionListById",
  needTicket: false,
  levelModerator: 0
};

exports.run = async request => {
  // State: 0 => Open (open, looking, voting)
  // State : 1 => Finished
  
  const competition = await competitionModel.findOne({ })
  .sort({ _id: -1 })
  .skip(request.pageindex)
  if (!competition) return buildXMLnull("GetMovieCompetitionListById");
  
  let Movie1id = Movie2id = Movie3id = 0;
  let Movie1 = Movie2 = Movie3 = null;
  
  const movies = await movieModel.aggregate([
    { $match: { CompetitionId: competition.MovieCompetitionId } },
    { $addFields: { len: { $size: "$CompetitionVotes" }}},
    { $sort: { len: -1 }},
    { $limit: 3 }
  ]);
  
  let Status = 0;
  if (Date.now() > addDays(competition.EndTime, 3).getTime()) Status = 1;
  
  let i = 0;
  
  for (let movie of movies) {
    i++;
    
    switch (i) {
      case 1:
        Movie1id = movie.MovieId;
        const user1 = await userModel.findOne({ ActorId: movie.ActorId });

        Movie1 = {
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
            ActorId: user1.ActorId,
            Name: user1.Name
          }
        };

        break;
      case 2:
        Movie2id = movie.MovieId;
        const user2 = await userModel.findOne({ ActorId: movie.ActorId });

        Movie2 = {
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
            ActorId: user2.ActorId,
            Name: user2.Name
          }
        };

        break;
      case 3:
        Movie3id = movie.MovieId;
        const user3 = await userModel.findOne({ ActorId: movie.ActorId });

        Movie2 = {
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
            ActorId: user3.ActorId,
            Name: user3.Name
          }
        };

        break;
    }
  };
  
  return buildXML("GetMovieCompetitionListById", {
    totalRecords: await competitionModel.countDocuments(),
    pageindex: request.pageindex,
    pagesize: 1,
    list: {
      MovieCompetition: {
       MovieCompetitionId: competition.MovieCompetitionId,
       Name: competition.Name,
       Description: competition.Description,
       RequiredText: competition.RequiredText,
       StartTime: formatDate(competition.StartTime),
       EndTime: formatDate(competition.EndTime),
       Status: Status,
       Movie1id: Movie1id,
       Movie2id: Movie2id,
       Movie3id: Movie3id,
       Prize1: competition.Prize1,
       Prize2: competition.Prize2,
       Prize3: competition.Prize3,
       Prize1VIP: competition.Prize1VIP,
       Prize2VIP: competition.Prize2VIP,
       Prize3VIP: competition.Prize3VIP,
       NewsId: competition.NewsId,
       Movie1: Movie1,
       Movie2: Movie2,
       Movie3: Movie3
      }
    }
  });
};