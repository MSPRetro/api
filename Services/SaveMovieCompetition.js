const {
	competitionModel,
	newsModel,
	movieModel,
	userModel
} = require("../Utils/Schemas.js");
const { formatDate, getNewId } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "SaveMovieCompetition",
	needTicket: true,
	levelModerator: 2
};

exports.run = async request => {
	let competition;

	if (request.competition.MovieCompetitionId == 0) {
		let MovieCompetitionId = (await getNewId("competition_id")) + 1;

		let news = await newsModel.findOne({}).sort({ _id: -1 });

		if (await competitionModel.findOne({ NewsId: news.NewsId })) {
			let NewsId = (await getNewId("news_id")) + 1;

			const newsNew = new newsModel({
				NewsId: NewsId,
				_Date: new Date(),
				Headline: news.Headline,
				Description: news.Description,
				SWF: news.SWF
			});
			await newsNew.save();

			news = await newsModel.findOne({}).sort({ _id: -1 });
		}

		competition = new competitionModel({
			MovieCompetitionId: MovieCompetitionId,
			Name: request.competition.Name,
			Description: request.competition.Description,
			RequiredText: request.competition.RequiredText,
			StartTime: new Date(request.competition.StartTime),
			EndTime: new Date(request.competition.EndTime),
			Prize1: request.competition.Prize1,
			Prize2: request.competition.Prize2,
			Prize3: request.competition.Prize3,
			Prize1VIP: request.competition.Prize1VIP,
			Prize2VIP: request.competition.Prize2VIP,
			Prize3VIP: request.competition.Prize3VIP,
			NewsId: news.NewsId,
			Comments: []
		});

		await competition.save();

		competition = await competitionModel.findOne({}).sort({ _id: -1 });
	} else {
		await competitionModel.updateOne(
			{ MovieCompetitionId: request.competition.MovieCompetitionId },
			{
				Name: request.competition.Name,
				Description: request.competition.Description,
				RequiredText: request.competition.RequiredText,
				StartTime: new Date(request.competition.StartTime),
				EndTime: new Date(request.competition.EndTime)
			}
		);

		competition = await competitionModel.findOne({
			MovieCompetitionId: request.competition.MovieCompetitionId
		});
	}
	// State: 0 => Open (and date verification, if it's passed it's finished)
	// State : 1 => Finished
	let Movie1id = (Movie2id = Movie3id = 0);
	let Movie1 = (Movie2 = Movie3 = null);

	const movies = await movieModel.aggregate([
		{ $match: { CompetitionId: competition.MovieCompetitionId } },
		{ $addFields: { len: { $size: "$CompetitionVotes" } } },
		{ $sort: { len: -1 } },
		{ $limit: 3 }
	]);

	let i = 0;

	for (let movie of movies) {
		i++;

		switch (i) {
			case 1:
				Movie1id = movie.MovieId;
				const user1 = await userModel.findOne({
					ActorId: movie.ActorId
				});

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
				const user2 = await userModel.findOne({
					ActorId: movie.ActorId
				});

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
				const user3 = await userModel.findOne({
					ActorId: movie.ActorId
				});

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
	}

	return buildXML("SaveMovieCompetition", {
		MovieCompetitionId: competition.MovieCompetitionId,
		Name: competition.Name,
		Description: competition.Description,
		RequiredText: competition.RequiredText,
		StartTime: formatDate(competition.StartTime),
		EndTime: formatDate(competition.EndTime),
		Status: 0,
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
		Movie1: null,
		Movie2: null,
		Movie3: null
	});
};
