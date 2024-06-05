const { newsModel, competitionModel } = require("../Utils/Schemas.js");
const { formatDate } = require("../Utils/Util.js");
const { buildXML, buildXMLnull } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "GetNewsById",
  needTicket: false,
  levelModerator: 0
};

exports.run = async request => {
  const news = await newsModel.findOne({ NewsId: request.newsId });
  if (!news) return buildXMLnull("GetNewsById");
  
  const competition = await competitionModel.findOne({ NewsId: news.NewsId });
  if (!competition) return buildXMLnull("GetNewsById");
  
  return buildXML("GetNewsById", {
    NewsId: news.News,
    _Date: formatDate(news._Date),
    Headline: news.Headline,
    Description: news.Description,
    SWF: news.SWF,
    NewsMovieCompetition: {
      MovieCompetitionId: competition.MovieCompetitionId,
      Name: competition.Name,
      NewsId: competition.NewsId
    }
  });
};