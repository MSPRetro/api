const { animationModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetHighscoreAnimations",
  needTicket: true,
  levelModerator: 0
};

exports.run = async request => {  
  const animations = await animationModel.aggregate([
    { $match: { IsHidden: 0, BuyBy: { $exists: true, $not: { $size: 0 }}}},
    { $addFields: { len: { $size: "$BuyBy" }}},
    { $sort: { len: -1 }},
    { $skip: request.pageindex * 5 },
    { $limit: 5 }
  ]);
  
  let animationsArray = [ ];
  
  for (let animation of animations) {
    animationsArray.push({
      count: animation.BuyBy.length,
      animationName: animation.Name,
      categoryName: animation.CategoryName,
      SWF: animation.SWF,
      Vip: animation.Vip,
      Price: animation.Price,
      AnimationCategoryId: animation.CategoryId,
      animationId: animation.AnimationId
    });
  };
  
  return buildXML("GetHighscoreAnimations", {
    totalRecords: await animationModel.countDocuments({ IsHidden: 0, BuyBy: { $exists: true, $not: { $size: 0 } }}),
    pageindex: request.pageindex,
    pagesize: 5,
    items: {
      HighscoreAnimation: animationsArray
    }
  });
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

    <s:complexType name="ArrayOfHighscoreAnimation">
        <s:sequence>
            <s:element maxOccurs="unbounded" minOccurs="0" name="HighscoreAnimation" nillable="true" type="tns:HighscoreAnimation"/>
        </s:sequence>
    </s:complexType>
    <s:complexType name="HighscoreAnimation">
        <s:sequence>
            <s:element name="count" nillable="true" type="s:int"/>
            <s:element minOccurs="0" name="animationName" type="s:string"/>
            <s:element minOccurs="0" name="categoryName" type="s:string"/>
            <s:element minOccurs="0" name="SWF" type="s:string"/>
            <s:element name="Vip" nillable="true" type="s:int"/>
            <s:element name="Price" type="s:int"/>
            <s:element name="AnimationCategoryId" type="s:int"/>
            <s:element name="animationId" type="s:int"/>
        </s:sequence>
    </s:complexType>
    */
