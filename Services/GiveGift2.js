const { userModel, giftModel, idModel, clothModel } = require("../Utils/Schemas.js");
const { buildXML, buildLevel, addMinutes, createTodo, getNewId } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GiveGift2",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  if (request.receiverActorId == ActorId) return;
  
  const user = await userModel.findOne({ ActorId: request.receiverActorId });
  const itemRelId = await idModel.findOne({ ActorId: ActorId, ClothesRellId: request.relId, IsWearing: 0 });
  
  if (![ "Gift_item_1.swf", "Gift_item_2.swf", "Gift_item_3.swf", "Gift_item_4.swf", "Gift_item_5.swf", "Gift_item_6.swf" ].includes(request.swf)
      || !user
      || !itemRelId
      || (buildLevel(user.Progression.Fame) < 3)
     ) return;
  
  await idModel.updateOne({ ActorId: ActorId, ClothesRellId: request.relId }, {
    ActorId: 0
  });
  
  const item = await clothModel.findOne({ ClothesId: itemRelId.ClothId });
  
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
  
  await userModel.updateOne({ ActorId: ActorId }, {
    $inc: {
      "Gifts.ValueOfGiftsGiven": item.Price
    }
  });
  
  await createTodo(ActorId, 8, false, 0, request.receiverActorId, 0, 0, GiftId);
  
  return buildXML("GiveGift2");
};