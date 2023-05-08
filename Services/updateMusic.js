const { musicModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "updateMusic",
  needTicket: true,
  levelModerator: 3
};

exports.run = async request => {  
  await musicModel.updateOne({ MusicId: request.music.MusicId }, {
    Name: request.music.Name,
    Price: request.music.Price,
    Vip: request.music.Vip,
    IsHidden: request.music.Deleted,
    New: request.music.New,
    Discount: request.music.Discount
  });
  
  return buildXML("updateMusic");
};