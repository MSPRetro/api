const { userModel, idBackgroundModel, backgroundModel } = require("../Utils/Schemas.js");
const { buildXML, getActorDetails, isModerator, isVip, addOrRemoveMoney, addFame, getNewId } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "BuyBackground",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId, IP, Password) => {
  const background = await backgroundModel.findOne({ BackgroundId: request.background.BackgroundId });
  if (!background) return;
      
  let user = await userModel.findOne({ ActorId: ActorId });
  
  let Price;
  
  if (background.Discount != 0) Price = background.Discount;
  else Price = background.Price;
  
  if (!await isModerator(ActorId, user, 3) && background.IsHidden == 1 || Price > user.Progression.Money) return;
  if (background.Vip != 0 && !await isVip(ActorId, user));
  if (await idBackgroundModel.findOne({ ActorId: ActorId, BackgroundId: background.BackgroundId })) return;
  
  let RellId = await getNewId("rell_background_id") + 1;
  
  await addOrRemoveMoney(ActorId, - Price);
  await addFame(ActorId, user, Price / 10);
  
  await backgroundModel.updateOne({ BackgroundId: background.BackgroundId }, { $push: { "BuyBy": ActorId } });
  
  const item = new idBackgroundModel({
    ActorId: ActorId,
    BackgroundRellId: RellId,
    BackgroundId: background.BackgroundId
  });
  await item.save();
  
  return buildXML("BuyBackground", await getActorDetails(ActorId, ActorId, Password));
};