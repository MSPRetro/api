const { userModel, clickitemModel, idclickitemModel } = require("../Utils/Schemas.js");
const { buildXML, getActorDetails, formatDate, isVip, addFame, getNewId } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "BuyClickItem",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  const clickitem = await clickitemModel.findOne({ ClickItemId: request.clickItemId });
  if (!clickitem) return;
  
  let user = await userModel.findOne({ ActorId: ActorId });
  if (clickitem.Vip != 0 && !await isVip(ActorId, user));
  if (clickitem.Price > user.Progression.Money || clickitem.Vip != 0 && !await isVip(ActorId, user)) return;
  
  let RellId = await getNewId("rell_clickitem_id") + 1;
  
  await userModel.updateOne({ ActorId: ActorId }, { $set: {
    "Progression.Money": user.Progression.Money - clickitem.Price
  } });
  
  await addFame(ActorId, user, clickitem.Price / 10);
  
  const item = new idclickitemModel({
    ActorClickItemRelId: RellId,
    ClickItemId: request.clickItemId,
    ActorId: ActorId,
    Name: "",
    Data: "",
    FoodPoints: 0,
    Stage: 0,
    LastFeedTime: new Date(0),
    x: 0,
    y: 0,
    LastWashTime: new Date(0),
    PlayPoints: 0,
    InRoom: 0,
    IsRecycled: 0
  });
  await item.save();
  
  return buildXML("BuyClickItem", await getActorDetails(ActorId, ActorId));
};