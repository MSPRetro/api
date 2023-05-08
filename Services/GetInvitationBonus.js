const { todoModel, userModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetInvitationBonus",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  const todo = await todoModel.findOne({ TodoId: request.todoId, Type: 4, FriendId: ActorId });
  if (!todo) return;
  
  const user = await userModel.findOne({ ActorId: ActorId });
  if (!user) return;
  
  await userModel.updateOne({ ActorId: ActorId }, { $set: {
    "Progression.Money": user.Progression.Money + 300
  } });
  
  await todoModel.updateMany({ ActorId: todo.ActorId, FriendId: ActorId, Type: 4 }, { ActorId: 0, FriendId: 0 });
  
  return buildXML("GetInvitationBonus");
}