const { idModel, clothModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetMyRoomClothes",
  needTicket: false,
  levelModerator: 0
};

exports.run = async request => {
  const items = await idModel.find({ ActorId: request.actorId, IsRecycled: 0, x: { $ne: 0 }, y: { $ne: 0 } });
  
  let itemsArray = [ ];
  
  for (let item of items) {
    const cloth = await clothModel.findOne({ ClothesId: item.ClothId });
    
    itemsArray.push({
      ActorClothesRelId: item.ClothesRellId,
      ActorId: item.ActorId,
      ClothesId: item.ClothId,
      Color: item.Colors,
      IsWearing: item.IsWearing,
      x: item.x,
      y: item.y,
      Cloth: {
        ClothesId: item.ClothId,
        Name: cloth.Name,
        SWF: cloth.SWF,
        ClothesCategoryId: cloth.ClothesCategoryId,
        Price: cloth.Price,
        ShopId: cloth.ShopId,
        SkinId: cloth.SkinId,
        Filename: cloth.Filename,
        Scale: cloth.Scale,
        Vip: cloth.Vip,
        RegNewUser: cloth.RegNewUser,
        sortorder: cloth.Sortorder,
        New: cloth.New,
        Discount: cloth.Discount,
        ClothesCategory: {
          ClothesCategoryId: cloth.ClothesCategoryId,
          Name: cloth.ClothesCategoryName,
          SlotTypeId: cloth.SlotTypeId,
          SlotType: {
            SlotTypeId: cloth.SlotTypeId,
            Name: cloth.ClothesCategoryName
          }
        }
      }
    });
  };
  
  return buildXML("GetMyRoomClothes", {
    ActorClothesRel: itemsArray
  });
};