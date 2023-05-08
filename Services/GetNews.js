const { newsModel, competitionModel } = require("../Utils/Schemas.js");
const { buildXML, buildXMLnull, formatDate } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetNews",
  needTicket: false,
  levelModerator: 0
};

exports.run = async request => {
  const news = await newsModel.findOne({ })
  .sort({ _id: -1 })
  .skip(request.pageindex)
  .limit(1);
  if (!news) return buildXMLnull("GetNews");
  
  const competition = await competitionModel.findOne({ NewsId: news.NewsId });
  if (!competition) return buildXMLnull("GetNews");
  
  return buildXML("GetNews", {
    totalRecords: await newsModel.countDocuments({ }),
    pageindex: request.pageindex,
    pagesize: 1,
    items: {
      News: {
        NewsId: news.NewsId,
        _Date: formatDate(news._Date),
        Headline: news.Headline,
        Description: news.Description,
        SWF: news.SWF,
        NewsMovieCompetition: {
          MovieCompetitionId: competition.MovieCompetitionId,
          Name: competition.Name,
          NewsId: competition.NewsId
        }
      }
    }
  });
};