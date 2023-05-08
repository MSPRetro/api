const { backgroundModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetHighscoreBackgrounds",
  needTicket: true,
  levelModerator: 0
};

exports.run = async request => {
  const backgrounds = await backgroundModel.aggregate([
    { $match: { IsHidden: 0, BuyBy: { $exists: true, $not: { $size: 0 }}}},
    { $addFields: { len: { $size: "$BuyBy" }}},
    { $sort: { len: -1 }},
    { $skip: request.pageindex * 7 },
    { $limit: 7 }
  ]);
  
  let backgroundsArray = [ ];
  
  for (let background of backgrounds) {
    backgroundsArray.push({
      count: background.BuyBy.length,
      backgroundName: background.Name,
      categoryName: background.CategoryName,
      URL: background.Filename,
      Vip: background.Vip,
      Price: background.Price,
      BackgroundCategoryId: background.CategoryId,
      backgroundId: background.BackgroundId
    });
  };
  
  return buildXML("GetHighscoreBackgrounds", {
    totalRecords: await backgroundModel.countDocuments({ IsHidden: 0, BuyBy: { $exists: true, $not: { $size: 0 } }}),
    pageindex: request.pageindex,
    pagesize: 7,
    items: {
      HighscoreBackground: backgroundsArray
    }
  });
};

/*
    <s:complexType name="HighscoreBackground">
        <s:sequence>
            <s:element name="count" nillable="true" type="s:int"/>
            <s:element minOccurs="0" name="backgroundName" type="s:string"/>
            <s:element minOccurs="0" name="categoryName" type="s:string"/>
            <s:element minOccurs="0" name="URL" type="s:string"/>
            <s:element name="Vip" nillable="true" type="s:int"/>
            <s:element name="Price" type="s:int"/>
            <s:element name="BackgroundCategoryId" type="s:int"/>
            <s:element name="backgroundId" type="s:int"/>
        </s:sequence>
    </s:complexType>
    */