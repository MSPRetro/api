const { friendModel, userModel } = require("../Utils/Schemas.js");
const { buildXML, createTodo } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "RequestFriendShip",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  if (request.friendId == 1) return buildXML("RequestFriendShip", true);
  if (request.friendId == ActorId || !await userModel.findOne({ ActorId: request.friendId })) return;
  
  const friend1 = await friendModel.findOne({ RequesterId: ActorId, ReceiverId: request.friendId });
  const friend2 = await friendModel.findOne({ ReceiverId: ActorId, RequesterId: request.friendId });
  
  if (!friend1 && !friend2) {    
    const friend = new friendModel({
      RequesterId: ActorId,
      ReceiverId: request.friendId,
      Status: 2
    });
    
    await friend.save();
  } else if (friend1 && !friend2) {
    if (friend1.Status == 1) return buildXML("RequestFriendShip", true);
    
    await friendModel.updateOne({ RequesterId: ActorId, ReceiverId: request.friendId }, {
      Status: 2
    });
  } else if (!friend1 && friend2) {
    if (friend2.Status == 1) return buildXML("RequestFriendShip", true);
    
    const friend = new friendModel({
      RequesterId: ActorId,
      ReceiverId: request.friendId,
      Status: 2
    });
    
    await friend.save();
  };
  
  await createTodo(ActorId, 3, false, 0, request.friendId, 0, 0, 0);
  
  return buildXML("RequestFriendShip", false);
}