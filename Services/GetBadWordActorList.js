const { userModel } = require("../Utils/Schemas.js");
const { buildXML, getActorDetails } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetBadWordActorList",
  needTicket: true,
  levelModerator: 1
};

exports.run = async (request, ActorId) => {  
  const users = await userModel.find({ "Extra.BadWordCount": { $ne: 0 } })
  .sort({ "Extra.BadWordCount": -1 })
  .skip(request.pageindex * 10)
  .limit(10);
  
  let userData = [ ];
  
  for (let user of users) {
    userData.push(await getActorDetails(user.ActorId, ActorId));
  };

  return buildXML("GetBadWordActorList", {
    totalRecords: await userModel.countDocuments({ "Extra.BadWordCount": { $ne: 0 } }),
    pageindex: request.pageindex,
    pagesize: 10,
    items: {
      ActorDetails: userData
    }
  });
};
