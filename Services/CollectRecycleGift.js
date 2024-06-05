const { userModel, clothModel, idModel } = require("../Utils/Schemas.js");
const { getNewId } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "CollectRecycleGift",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  const user = await userModel.findOne({ ActorId: ActorId });
  if (1000 > user.Extra.RecyclePoints) return;
  
  const item = await clothModel.findOne({ ShopId: {
    $in: [ 2000, 2001, 2002, 2003, 2004, 2005, 2006 ]
  }, IsHidden: 0 })
  .skip(Math.floor(Math.random() * await clothModel.countDocuments({ ShopId: {
    $in: [ 2000, 2001, 2002, 2003, 2004, 2005, 2006 ]
  }, IsHidden: 0 })));
  
  await userModel.updateOne({ ActorId: ActorId }, { $set: {
    "Extra.RecyclePoints": user.Extra.RecyclePoints - 1000
  } });
  
  let rellId = await getNewId("rell_clothes_id") + 1;
  
  const rell = new idModel({
    ActorId: ActorId,
    ClothesRellId: rellId,
    ClothId: item.ClothesId,
    Colors: "",
    x: 0,
    y: 0,
    IsWearing: 0,
    IsRecycled: 0,
  });
  await rell.save();
  
  return buildXML("CollectRecycleGift", {
    swf: `/swf/stuff/${item.Filename}`,
    Name: item.Name
  });
};