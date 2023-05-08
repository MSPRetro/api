const { commentMovieModel, userModel } = require("../Utils/Schemas.js");
const { buildXML, buildPage, formatDate } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetMovieRatings",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  const reviews = await commentMovieModel.find({ MovieId: request.movieId, Comment: { $ne: "" } })
  .sort({ _id: -1 })
  .skip(request.pageindex * 3)
  .limit(3);
  
  let reviewsArray = [ ];
  
  for(let review of reviews) {
    const user = await userModel.findOne({ ActorId: review.ActorId });
    
    reviewsArray.push({
      RateMovieId: review.RateMovieId,
      MovieId: request.movieId,
      ActorId: review.ActorId,
      Score: review.Score,
      Comment: review.Comment,
      RateDate: formatDate(review.RateDate),
      ActorRateList: {
        ActorId: user.ActorId,
        Name: user.Name
      }
    })
  };
    
  return buildXML("GetMovieRatings", {
    totalRecords: await commentMovieModel.countDocuments({ MovieId: request.movieId, Comment: { $ne: "" } }),
    pageindex: request.pageindex,
    pagesize: 3,
    items: {
      RateMovieList: reviewsArray
    }
  });
};
