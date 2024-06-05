const { clothModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "LoadClothes",
  needTicket: false,
  levelModerator: 0
};

exports.run = async request => {
  
  /* request.shopId
  1 : Clothes
  3 : Shoes
  4 : Hairs
  700 : Accessories
  800 : Pet Accessories
  900 : Garden Accessories
  1000 : Costumes
  2000 : Zoo
  2001 : Instruments
  2002 : Foods
  2003 : Vehicles
  2004 : Gadgets
  2005 : Furnitures
  2006 : Props
  */
  
  
  let items;
  let itemsArray = [ ];
  
  switch (request.shopId) {
    case 1:      
      items = await clothModel.find({ ShopId: 2, SkinId: { $in: [ 0, request.skinId ] }, IsHidden: 0 });
      
      break;
    case 2:
    case 3:
    case 4:
    case 700:
    case 800:
    case 900:
    case 1000:
    case 2000:
    case 2001:
    case 2002:
    case 2003:
    case 2004:
    case 2005:
    case 2006:
      items = await clothModel.find({ ShopId: request.shopId, SkinId: { $in: [ 0, request.skinId ] }, IsHidden: 0 });
      
      break;
    case -100:
      items = await clothModel.find({ IsHidden: 1 });
      
      break;
    default:
      items = [ ];
  };
    
  for (let item of items) {        
    itemsArray.push({
        ClothesId: item.ClothesId,
        Name: item.Name,
        SWF: item.SWF,
        ClothesCategoryId: item.ClothesCategoryId,
        Price: item.Price,
        ShopId: request.shopId,
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
  
  return buildXML("LoadClothes", {
    Cloth: itemsArray
  });
};