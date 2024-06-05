const { idModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "LoadActorItems",
  needTicket: false,
  levelModerator: 0
};

exports.run = async request => {
  const items = await idModel.aggregate([
    {
      $match: {
        ActorId: request.actorId,
        IsRecycled: 0
      }
    },
    {
      $lookup: {
        from: "clothes",
        localField: "ClothId",
        foreignField: "ClothesId",
        as: "cloth"
      }
    },
    {
      $unwind: "$cloth"
    },
    {
      $project: {
        _id: 0,
        ActorClothesRelId: "$ClothesRellId",
        ActorId: "$ActorId",
        ClothesId: "$ClothId",
        Color: "$Colors",
        IsWearing: "$IsWearing",
        x: "$x",
        y: "$y",
        Cloth: {
          ClothesId: "$ClothId",
          Name: "$cloth.Name",
          SWF: "$cloth.SWF",
          ClothesCategoryId: "$cloth.ClothesCategoryId",
          Price: "$cloth.Price",
          ShopId: "$cloth.ShopId",
          SkinId: "$cloth.SkinId",
          Filename: "$cloth.Filename",
          Scale: "$cloth.Scale",
          Vip: "$cloth.Vip",
          RegNewUser: "$cloth.RegNewUser",
          sortorder: "$cloth.Sortorder",
          New: "$cloth.New",
          Discount: "$cloth.Discount",
          ClothesCategory: {
            ClothesCategoryId: "$cloth.ClothesCategoryId",
            Name: "$cloth.ClothesCategoryName",
            SlotTypeId: "$cloth.SlotTypeId",
            SlotType: {
              SlotTypeId: "$cloth.SlotTypeId",
              Name: "$cloth.ClothesCategoryName"
            }
          }
        }
      }
    }
  ]);
  
  return buildXML("LoadActorItems", {
    ActorClothesRel: items
  });
};
