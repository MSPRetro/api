const { clothModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetHighscoreClothes",
  needTicket: true,
  levelModerator: 0
};

exports.run = async request => {
  let clothes;
  let match;
  
  if (request.shopType === "clothes") {
    match = { ShopId: { $in: [ 1, 3, 4, 700, 1000 ] }, IsHidden: 0, BuyBy: { $exists: true, $not: { $size: 0 } } };
    
    clothes = await clothModel.aggregate([
      { $match: { IsHidden: 0, BuyBy: { $exists: true, $not: { $size: 0 }}}},
      { $addFields: { len: { $size: "$BuyBy" }}},
      { $sort: { len: -1 }},
      { $skip: request.pageindex * 7 },
      { $limit: 7 }
    ]);
  } else {
    match = { ShopId: { $in: [ 2000, 2001, 2002, 2003, 2004, 2005, 2006 ] }, IsHidden: 0, BuyBy: { $exists: true, $not: { $size: 0 } } };
    
    clothes = await clothModel.aggregate([
      { $match: match },
      { $addFields: { len: { $size: "$BuyBy" }}},
      { $sort: { len: -1 }},
      { $skip: request.pageindex * 7 },
      { $limit: 7 }
    ]);
  };
  
  let clothesArray = [ ];
  
  for (let clothe of clothes) {    
    clothesArray.push({
      count: clothe.BuyBy.length,
      clothesName: clothe.Name,
      categoryName: clothe.ClothesCategoryName,
      SWF: clothe.SWF,
      Filename: clothe.Filename,
      Vip: clothe.Vip,
      Price: clothe.Price,
      ClothesCategoryId: clothe.ClothesCategoryId,
      ShopId: clothe.ShopId,
      clothesId: clothe.ClothesId,
      skinId: clothe.SkinId
    });
  };
  
  return buildXML("GetHighscoreClothes", {
    totalRecords: await clothModel.countDocuments(match),
    pageindex: request.pageindex,
    pagesize: 7,
    items: {
      HighscoreCloth: clothesArray
    }
  });
};