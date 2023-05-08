const { backgroundModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "updateBackground",
  needTicket: true,
  levelModerator: 3
};

exports.run = async request => {  
  await backgroundModel.updateOne({ BackgroundId: request.background.BackgroundId }, {
    Name: request.background.Name,
    Price: request.background.Price,
    Vip: request.background.Vip,
    IsHidden: request.background.Deleted,
    New: request.background.New,
    Discount: request.background.Discount
  });
  
  return buildXML("updateBackground");
};

/*
exports.animationModel = model(
  "animations",
  new Schema({
    Id: Number,
    Name: String,
    SWF: String,
    CategoryId: Number,
    Price: Number,
    SkinId: Number,
    Filename: String,
    Vip: Number,
    Discount: Number,
    ThemeID: Number,
    DiamondsPrice: Number,
    AvailableUntil: String,
    ColorScheme: String,
    CategoryId1: Number,
    CategoryName: String,
    SlotTypeId: Number
  })
);
*/