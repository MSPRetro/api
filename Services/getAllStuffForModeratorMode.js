const { itemModel, clothModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "getAllStuffForModeratorMode",
  needTicket: false,
  levelModerator: 0
};

exports.run = async () => {  
  const items = await clothModel.find({ ClothesCategoryName: "Stuff" /*, Filename: { $ne: "" } */})
  .limit(500);
  
  let itemsArray = [ ];
  
  for (let item of items) {
    itemsArray.push({
        ClothesId: item.ClothesId,
        Name: item.Name,
        SWF: item.SWF,
        ClothesCategoryId: item.ClothesCategoryId,
        Price: item.Price,
        ShopId: item.ShopId,
        SkinId: item.SkinId,
        Filename: item.Filename,
        Scale: item.Scale,
        Vip: item.Vip,
        RegNewUser: item.RegNewUser,
        sortorder: item.Sortorder,
        New: item.New,
        Discount: item.Discount,
        ClothesCategory: {
          ClothesCategoryId: item.ClothesCategoryId,
          Name: item.ClothesCategoryName,
          SlotTypeId: item.SlotTypeId,
          SlotType: {
              SlotTypeId: item.SlotTypeId,
              Name: item.ClothesCategoryName
          }
        }
      }
    );
  };
  
  return buildXML("getAllStuffForModeratorMode", {
    Cloth: itemsArray
  });
};