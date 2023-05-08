const { buildXML } = require("../Utils/Util.js");
const { musicModel } = require("../Utils/Schemas.js");

exports.data = {
  SOAPAction: "GetMusic",
  needTicket: true,
  levelModerator: 0
};

exports.run = async request => {
  const musics = await musicModel.find({ IsHidden: 0 })
  .sort({ _id: -1 });
  
  let musicsArr = [ ];
  
  for (let music of musics) {
    musicsArr.push({
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
    });
  };
  
  return buildXML("GetMusic", {
    Music: musicsArr
  });
};