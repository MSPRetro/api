const { pollModel, confModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "GetPoll",
  needTicket: false,
  levelModerator: 0
};

exports.run = async request => {
  let config = await confModel.find({  });
  config = config[0];
  
  return buildXML("GetPoll", {
    PollId: config.PollId,
    Question: config.Question,
    Answer1: config.Answer1,
    Answer2: config.Answer2,
    Answer3: config.Answer3,
    Answer4: config.Answer4,
    Answer1Count: await pollModel.countDocuments({ PollId: config.PollId, Answer: 1 }),
    Answer2Count: await pollModel.countDocuments({ PollId: config.PollId, Answer: 2 }),
    Answer3Count: await pollModel.countDocuments({ PollId: config.PollId, Answer: 3 }),
    Answer4Count: await pollModel.countDocuments({ PollId: config.PollId, Answer: 4 }),
    PollIsOpen: 1
  });
};
