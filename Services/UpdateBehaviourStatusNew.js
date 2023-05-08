const { behaviorModel, logModel, IPModel } = require("../Utils/Schemas.js");
const { buildXML, isModerator, getNewId } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "UpdateBehaviourStatusNew",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  if (!await isModerator(ActorId, false, 1) && request.behaviourStatus == 1) return;
  
  if (!await isModerator(ActorId, false, 1)) {
    await behaviorModel.updateMany({ ActorId: ActorId, BehaviourStatus: 1 }, {
      BehaviourStatus: 2
    });
  } else {
    if (await isModerator(request.actorId, false, 1)) return;
    
    const chatlog = await logModel.findOne({ ActorId: request.actorId, LogId: request.chatLogId });
    if (!chatlog) return;
    
    const IP = await IPModel.findOne({ IPId: chatlog.IPId });
    
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
      LockedDays: 0
    });
    await behavior.save();
        
    await IPModel.updateOne({ IPId: IP.IPId }, { $set: { Warns: IP.Warns + 1 } });
  };

  return buildXML("UpdateBehaviourStatusNew");
};