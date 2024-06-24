const { userModel, boyfriendModel } = require("../Utils/Schemas.js");
const { createTodo, formatDate } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "AskToBeByBoyFriend",
	needTicket: true,
	levelModerator: 0
};

exports.run = async (request, ActorId) => {
	if (request.actorIdOfAsked == ActorId) return;

	const user = await userModel.findOne({ ActorId: request.actorIdOfAsked });
	if (!user) return;

	const boyfriend = await boyfriendModel.findOne({
		RequesterId: ActorId,
		ReceiverId: request.actorIdOfAsked
	});

	/*
  boyfriend.Status
  0 : None
  1 : Waiting for answer
  2 : In relationship
  3 : Declined
  */

	// put all pending invites of the requester to the NONE status
	await boyfriendModel.updateMany({ RequesterId: ActorId }, { Status: 0 });

	if (!boyfriend) {
		const friend = new boyfriendModel({
			RequesterId: ActorId,
			ReceiverId: request.actorIdOfAsked,
			Status: 1
		});

		await friend.save();
	} else {
		await boyfriendModel.updateOne(
			{ RequesterId: ActorId, ReceiverId: request.actorIdOfAsked },
			{ Status: 1 }
		);
	}

	await createTodo(ActorId, 5, false, 0, request.actorIdOfAsked, 0, 0, 0);

	return buildXML("AskToBeByBoyFriend", false);
};

/*
actor : user of the displayed profile
loggedInActor : user of the logged actor


if (actor.ActorId == loggedInActor.ActorId)
{
  btnBreakUp.visible = false;
  btnBoyfriend.visible = false;
}
else
{
  if (actor.ActorId == loggedInActor.BoyfriendId)
  {
    switch (loggedInActor.BoyfriendStatus)
    {
      case BoyFriendStatus.NONE:
        if (isGirl)
          {
              btnBoyfriend.label = resourceManager.getString("myResources", "ASK_GIRLFRIEND");
          }
          else
          {
              btnBoyfriend.label = resourceManager.getString("myResources", "ASK_BOYFRIEND");
          };
          btnBoyfriend.visible = true;
          break;
      case BoyFriendStatus.INRELATIONSHIP:
          btnBreakUp.visible = true;
          btnBoyfriend.visible = false;
          break;
      case BoyFriendStatus.WAITINGFORANSWER:
          if (isGirl)
          {
              btnBoyfriend.label = resourceManager.getString("myResources", "WAITING_GIRLFRIEND");
          }
          else
          {
              btnBoyfriend.label = resourceManager.getString("myResources", "WAITING_BOYFRIEND");
          };
          btnBoyfriend.visible = true;
          break;
      case BoyFriendStatus.DECLINED:
          if (isGirl)
          {
              btnBoyfriend.label = resourceManager.getString("myResources", "SAID_NO");
          }
          else
          {
              btnBoyfriend.label = resourceManager.getString("myResources", "SAID_NO");
          };
          btnBoyfriend.visible = true;
          break;
    };
  }
  else
  {
    if (isGirl)
    {
      btnBoyfriend.label = resourceManager.getString("myResources", "ASK_GIRLFRIEND");
    }
    else
    {
      btnBoyfriend.label = resourceManager.getString("myResources", "ASK_BOYFRIEND");
    };
    btnBoyfriend.visible = true;
  };
};
*/
