const { friendModel, todoModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "RejectFriendShip",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {  
  await friendModel.updateOne({ ReceiverId: ActorId, RequesterId: request.friendId }, {
    Status: 0
  });
  
  await todoModel.updateMany({ ActorId: request.friendId, FriendId: ActorId, Type: 3 }, { ActorId: 0, FriendId: 0 });
  return buildXML("RejectFriendShip");
}