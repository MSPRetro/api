const { userModel, behaviorModel, logModel } = require("../Utils/Schemas.js");
const { buildXML, formatDate, getNewId } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "LockOutUser",
  needTicket: true,
  levelModerator: 1
};

exports.run = async (request, ActorId) => {
  const chatlog = await logModel.findOne({ ActorId: request.actorId, LogId: request.chatLogId });
  if (!chatlog) return;
  
  let BehaviorId = await getNewId("behavior_id") + 1;
  
  const behavior = new behaviorModel({
    BehaviorId: BehaviorId,
    ActorId: request.actorId,
    HandledByActorId: ActorId,
    LockedText: request.lockedText,
    ChatlogId: request.chatLogId,
    IPId: chatlog.IPId,
    BehaviourStatus: 1,
    HandledOn: new Date(),
    LockedDays: request.numberOfDays
  });
    
  await behavior.save();

  return buildXML("LockOutUser");
};