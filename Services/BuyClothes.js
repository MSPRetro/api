const { idModel, clothModel, userModel } = require("../Utils/Schemas.js");
const { buildXML, getActorDetails, isModerator, isVip, addFame, getNewId } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "BuyClothes",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {  
  let itemsArray = [ ];
  
  if (request.items.ActorClothesRel2.ActorClothesRelId !== undefined) {
    for (let i in request.items.ActorClothesRel2) {
      if (isNaN(request.items.ActorClothesRel2[i] && typeof request.items.ActorClothesRel2[i] !== "string")) request.items.ActorClothesRel2[i] = "";
    };
    
    itemsArray.push(await BuyClothes(request.items.ActorClothesRel2, ActorId));
    
    return buildXML("BuyClothes", {
      items: {
        ActorClothesRel: itemsArray,
      },
      actorDetails: await getActorDetails(ActorId, ActorId)
    });
  };
    
  for (let clothes of request.items.ActorClothesRel2) {
    itemsArray.push(await BuyClothes(clothes, ActorId));
  };
  const user = await userModel.findOne({ ActorId: ActorId });
  
  return buildXML("BuyClothes", {
    items: {
      ActorClothesRel: itemsArray,
    },
    actorDetails: await getActorDetails(ActorId, ActorId)
  });
}

async function BuyClothes(clothes, ActorId) {  
  let user = await userModel.findOne({ ActorId: ActorId });
  if (user.Clinic.SkinSWF === "femaleskin") user.Clinic.SkinSWF = 1;
  else user.Clinic.SkinSWF = 2;
   
  const clothe = await clothModel.findOne({ ClothesId: clothes.ClothesId });
  if (!clothe) return;
  
  if (!await isModerator(ActorId, user, 3) && clothe.IsHidden != 0) return { };
   
  let Price;
  
  if (clothe.Discount != 0) Price = clothe.Discount;
  else Price = clothe.Price;
  
  if (Price > user.Progression.Money || user.Clinic.SkinSWF != clothe.SkinId && clothe.SkinId != 0) return { };
  if (clothe.Vip != 0 && !await isVip(ActorId, user)) return { };
  
  await userModel.updateOne({ ActorId: ActorId }, { $set: {
    "Progression.Money": user.Progression.Money - Price
  } });
  
  await addFame(ActorId, user, Price / 10);
  
  let rellId = await getNewId("rell_clothes_id") + 1;
  
  const rell = new idModel({
    ActorId: ActorId,
    ClothesRellId: rellId,
    ClothId: clothes.ClothesId,
    Colors: clothes.Color,
    x: 0,
    y: 0,
    IsWearing: 0,
    IsRecycled: 0,
  });
  await rell.save();
  
  await clothModel.updateOne({ ClothesId: clothes.ClothesId }, { $push: { "BuyBy": ActorId } });
    
  return {
    ActorClothesRelId: rellId,
    ActorId: ActorId,
    ClothesId: clothes.ClothesId,
    Color: clothes.Color,
    IsWearing: 0,
    x: 0,
    y: 0,
    Cloth: {
      ClothesId: clothes.ClothesId,
      Name: clothe.Name,
      SWF: clothe.SWF,
      ClothesCategoryId: clothe.ClothesCategoryId,
      Price: clothe.Price,
      ShopId: clothe.ShopId,
      SkinId: clothe.SkinId,
      Filename: clothe.Filename,
      Scale: clothe.Scale,
      Vip: clothe.Vip,
      RegNewUser: clothe.RegNewUser,
      sortorder: clothe.Sortorder,
      New: clothe.New,
      Discount: clothe.Discount,
      ClothesCategory: {
        ClothesCategoryId: clothe.ClothesCategoryId,
        Name: clothe.ClothesCategoryName,
        SlotTypeId: clothe.SlotTypeId,
        SlotType: {
          SlotTypeId: clothe.SlotTypeId,
          Name: clothe.ClothesCategoryName
        }
      }
    }
  };
}