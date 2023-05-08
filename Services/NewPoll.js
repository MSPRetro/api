const { confModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "NewPoll",
  needTicket: true,
  levelModerator: 2
};

exports.run = async (request, ActorId) => {
  let config = await confModel.find({  });
  config = config[0];
  
  let PollId = config.PollId;
  PollId++;
  
  await confModel.updateMany({ }, {
    PollId: PollId,
    Question: request.question,
    Answer1: request.answer1,
    Answer2: request.answer2,
    Answer3: request.answer3,
    Answer4: request.answer4,
    ActorId: ActorId,
    $push: {
      "LastPolls": {
        PollId: config.PollId,
        Question: config.Question,
        Answer1: config.Answer1,
        Answer2: config.Answer2,
        Answer3: config.Answer3,
        Answer4: config.Answer4,
        ActorId: config.ActorId,
      }
    }
  });
  
  return buildXML("NewPoll");
};