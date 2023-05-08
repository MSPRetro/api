const { userModel, giftModel, idModel } = require("../Utils/Schemas.js");
const { buildXML, buildLevel, addMinutes, createTodo, getNewId } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GiveGift2",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  if (request.receiverActorId == ActorId) return;
  
  const user = await userModel.findOne({ ActorId: request.receiverActorId });
  
  if (![ "Gift_item_1.swf", "Gift_item_2.swf", "Gift_item_3.swf", "Gift_item_4.swf", "Gift_item_5.swf", "Gift_item_6.swf" ].includes(request.swf)
      || !user
      || !await idModel.findOne({ ActorId: ActorId, ClothesRellId: request.relId, IsWearing: 0 })
      || (buildLevel(user.Progression.Fame) <= 3)
     ) return;
  
  /*
  if (new Date(user.Extra.TimeGiftGiven).getTime() > Date.now() && user.Extra.GiftGivenInTheHour >= 5) return { statuscode: 500 };
  if (new Date(user.Extra.TimeGiftGiven).getTime() < Date.now()) {
    await userModel.updateOne({ ActorId: ActorId }, { $set: {
      "Extra.TimeGiftGiven": new Date(addMinutes(new Date(), 60)),
      "Extra.GiftGivenInTheHour": 1
    }});
  } else {
    const giver = await userModel.findOne({ ActorId: ActorId });
    
    await userModel.updateOne({ ActorId: ActorId }, { $set: {
      "Extra.GiftGivenInTheHour": giver.Extra.GiftGivenInTheHour + 1
    }});
  };
  */
  
  await idModel.updateOne({ ActorId: ActorId, ClothesRellId: request.relId }, {
    ActorId: 0
  });
  
  let GiftId = await getNewId("gift_id") + 1;
  
  const gift = new giftModel({
    GiftId: GiftId,
    SenderActorId: ActorId,
    ReceiverActorId: request.receiverActorId,
    ClothesRellId: request.relId,
    State: 0,
    SWF: request.swf
  });
  await gift.save();
  
  await createTodo(ActorId, 8, false, 0, request.receiverActorId, 0, 0, GiftId);
  
  return buildXML("GiveGift2");
};