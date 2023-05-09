const { userModel, musicModel, idMusicModel } = require("../Utils/Schemas.js");
const { buildXML, getActorDetails, isModerator, addFame, getNewId } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "BuyMusic",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId, IP, Password) => {
  const music = await musicModel.findOne({ MusicId: request.music.MusicId });
  if (!music) return;
    
  let user = await userModel.findOne({ ActorId: ActorId });
  
  let Price;
  
  if (music.Discount != 0) Price = music.Discount;
  else Price = music.Price;
  
  if (!await isModerator(ActorId, user, 3) && music.IsHidden == 1 || Price > user.Progression.Money) return;
  
  if (await idMusicModel.findOne({ ActorId: ActorId, MusicId: music.MusicId })) return;
  
  let RellId = await getNewId("rell_music_id") + 1;
  
  await userModel.updateOne({ ActorId: ActorId }, { $set: {
    "Progression.Money": user.Progression.Money - Price,
    "Progression.Fame": user.Progression.Fame + (Price / 10)
  } });
  
  await addFame(ActorId, user, Price / 10);
  
  await musicModel.updateOne({ MusicId: music.MusicId }, { $push: { "BuyBy": ActorId } });
  
  const item = new idMusicModel({
    ActorId: ActorId,
    MusicRellId: RellId,
    MusicId: music.MusicId
  });
  await item.save();
  
  return buildXML("BuyMusic", await getActorDetails(ActorId, ActorId, Password));
};