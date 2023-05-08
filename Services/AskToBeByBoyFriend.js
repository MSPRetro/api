const { userModel, boyfriendModel } = require("../Utils/Schemas.js");
const { buildXML, createTodo, formatDate } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "AskToBeByBoyFriend",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  if (request.actorIdOfAsked == ActorId) return;
  
  const user = await userModel.findOne({ ActorId: request.actorIdOfAsked });
  if (!user) return;
  
  const boyfriend1 = await boyfriendModel.findOne({ RequesterId: ActorId, ReceiverId: request.actorIdOfAsked });
  const boyfriend2 = await boyfriendModel.findOne({ ReceiverId: ActorId, RequesterId: request.actorIdOfAsked });
  
  if (!boyfriend1 && !boyfriend2) {
    await boyfriendModel.updateMany({ RequesterId: ActorId }, { Status: 0 });
        
    const friend = new boyfriendModel({
      RequesterId: ActorId,
      ReceiverId: request.actorIdOfAsked,
      Status: 2
    });
    
    await friend.save();
  } else if (boyfriend1 && !boyfriend2) {    
    if (boyfriend1.Status == 1) return buildXML("AskToBeByBoyFriend", true);
    
    await boyfriendModel.updateMany({ RequesterId: ActorId }, { Status: 0 });
    
    await boyfriendModel.updateOne({ FriendId: boyfriend1.FriendId }, {
      Status: 2
    });
  } else if (!boyfriend1 && boyfriend2) {
    if (boyfriend2.Status == 2) return buildXML("AskToBeByBoyFriend", true);
    
    await boyfriendModel.updateMany({ RequesterId: ActorId }, { Status: 0 });
    
    const friend = new boyfriendModel({
      RequesterId: ActorId,
      ReceiverId: request.actorIdOfAsked,
      Status: 2
    });
    
    await friend.save();
  };
  
  await createTodo(ActorId, 5, false, 0, request.actorIdOfAsked, 0, 0, 0);
  
  return buildXML("AskToBeByBoyFriend", false);
};