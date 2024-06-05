const { pollModel, confModel, userModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "TakePoll",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  let config = await confModel.find({  });
  config = config[0];
  
  if (request.answer <= 1 && request.answer >= 4 || await pollModel.findOne({ ActorId: ActorId, PollId: config.PollId })) return;
  
  const poll = new pollModel({ ActorId: ActorId, PollId: config.PollId, Answer: request.answer });
  await poll.save();
  
  return buildXML("TakePoll");
};
