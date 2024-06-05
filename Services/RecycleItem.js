const { userModel, idModel, idclickitemModel, clothModel, clickitemModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "RecycleItem",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  let Price;
  
  if (request.actorClickItemRelId == 0) {
    const ClothesRellId = await idModel.findOne({ ActorId: ActorId, ClothesRellId: request.actorClothesRelId, IsRecycled: 0 });
    if (!ClothesRellId) return;
    
    await idModel.updateOne({ ClothesRellId: request.actorClothesRelId }, { IsWearing: 0, IsRecycled: 1 });
    
    const clothe = await clothModel.findOne({ ClothesId: ClothesRellId.ClothId });
    Price = clothe.Price;
  } else {
    const ActorClickItemRelId = await idclickitemModel.findOne({ ActorId: ActorId, ActorClickItemRelId: request.actorClickItemRelId, IsRecycled: 0 });
    if (!ActorClickItemRelId) return;
    
    await idclickitemModel.updateOne({ ActorClickItemRelId: request.actorClickItemRelId }, { IsWearing: 0, IsRecycled: 1 });
    
    const clickitem = await clickitemModel.findOne({ ClickItemId: ActorClickItemRelId.ClickItemId });
    Price = clickitem.Price;
  };
  
  const user = await userModel.findOne({ ActorId: ActorId });
  await userModel.updateOne({ ActorId: ActorId }, { $set: { "Extra.RecyclePoints": user.Extra.RecyclePoints + Math.round(Price / 6) } });
  
  return buildXML("RecycleItem", user.Extra.RecyclePoints + Math.round(Price / 6));
}

/*
{
  actorId: 1,
  actorClothesRelId: 72,
  actorClickItemRelId: 0,
  TicketHeader: {
    Ticket: '1,1642766243357,tsrU5huEKVjxW9lauLtd6hNFgEGTVMmnw8qacve7'
  }
}
*/