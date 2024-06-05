const { buildXML } = require("../Utils/XML.js");
const { idMusicModel, musicModel } = require("../Utils/Schemas.js");

exports.data = {
  SOAPAction: "GetMyMusic",
  needTicket: false,
  levelModerator: 0
};

exports.run = async request => {
  const musics = await idMusicModel.find({ ActorId: request.actorId });
  
  let musicsArr = [ ];
  
  for (let musicActor of musics) {
    const music = await musicModel.findOne({ MusicId: musicActor.MusicId });
    
    musicsArr.push({
      ActorMusicRelId: musicActor.ActorMusicRelId,
      ActorId: request.actorId,
      MusicId: musicActor.AnimationId,
      Music: {
        MusicId: music.MusicId,
        Name: music.Name,
        Url: music.Url,
        MusicCategoryId: music.CategoryId,
        Price: music.Price,
        Level: 0,
        Vip: music.Vip,
        Deleted: music.IsHidden,
        New: music.New,
        Discount: music.Discount,
        MusicCategory: {
          MusicCategoryId: music.CategoryId,
          Name: music.CategoryName
        }
      }
    });
  };
  
  return buildXML("GetMyMusic", {
    ActorMusicRel: musicsArr
  });
};