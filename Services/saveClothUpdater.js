const { clothModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "saveClothUpdater",
  needTicket: true,
  levelModerator: 3
};

exports.run = async request => {
  for (let i in request.cloth) {
    if (isNaN(request.cloth[i] && typeof request.cloth[i] !== "string")) request.cloth[i] = "";
  };
  
  let IsHidden = 0;
  let cloth;
  if (request.cloth.ShopId == 1) request.cloth.ShopId = 2;
  if (request.cloth.ShopId == -100) {
    cloth = await clothModel.findOne({ ClothesId: request.cloth.ClothesId });
    if (!cloth) return;
    
    request.cloth.ShopId = cloth.ShopId;
    IsHidden = 1;
  };
  
  await clothModel.updateOne({ ClothesId: request.cloth.ClothesId }, { $set: {
    Name: request.cloth.Name,
    Price: request.cloth.Price,
    ShopId: request.cloth.ShopId,
    SkinId: request.cloth.SkinId,
    Scale: request.cloth.Scale,
    Vip: request.cloth.Vip,
    RegNewUser: request.cloth.RegNewUser,
    Sortorder: request.cloth.sortorder,
    New: request.cloth.New,
    Discount: request.cloth.Discount,
    IsHidden: IsHidden
  } });
  
  cloth = await clothModel.findOne({ ClothesId: request.cloth.ClothesId });
  if (IsHidden == 1) cloth.ShopId == -100;
  
  return buildXML("saveClothUpdater", {
    ClothesId: cloth.ClothesId,
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
    Discount: cloth.Discount
  });
};