const { animationModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "updateAnimation",
  needTicket: true,
  levelModerator: 3
};

exports.run = async request => {  
  await animationModel.updateOne({ AnimationId: request.animation.AnimationId }, {
    Name: request.animation.Name,
    Price: request.animation.Price,
    Vip: request.animation.Vip,
    IsHidden: request.animation.Deleted,
    New: request.animation.New,
    Discount: request.animation.Discount
  });
  
  return buildXML("updateAnimation");
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