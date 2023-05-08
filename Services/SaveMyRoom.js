const { userModel, idModel } = require("../Utils/Schemas.js");
const { buildXML, createActivity } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "SaveMyRoom",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  await idModel.updateMany({ ActorId: ActorId }, { x: 0, y: 0 });
  
  await userModel.updateOne({ ActorId: ActorId }, { $set: {
    "Room.Wallpaper": request.wallpaper,
    "Room.Floor": request.floor
  }});
  
  await createActivity(ActorId, 5, 0, 0, 0, 0);
  
  if (typeof request.myRoomInstanceList === "number") return buildXML("SaveMyRoom");
  
  if (request.myRoomInstanceList.MyRoomInstance.ActorClothesRelId !== undefined) {
    const item = await idModel.findOne({ ActorId: ActorId, ClothesRellId: request.myRoomInstanceList.MyRoomInstance.ActorClothesRelId });
    if (!item) return;
    
    await idModel.updateOne({ ClothesRellId: request.myRoomInstanceList.MyRoomInstance.ActorClothesRelId }, { x: request.myRoomInstanceList.MyRoomInstance.x, y: request.myRoomInstanceList.MyRoomInstance.y });

    return buildXML("SaveMyRoom");
  }
  
  for (let cloth of request.myRoomInstanceList.MyRoomInstance) {
    const item = await idModel.findOne({ ActorId: ActorId, ClothesRellId: cloth.ActorClothesRelId });
    if (!item) continue;
    
    await idModel.updateOne({ ClothesRellId: cloth.ActorClothesRelId }, { x: cloth.x, y: cloth.y });
  };
  
  return buildXML("SaveMyRoom");
}