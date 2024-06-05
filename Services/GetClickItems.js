const { clickitemModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "GetClickItems",
  needTicket: false,
  levelModerator: 0
};

exports.run = async request => {
  const items = await clickitemModel.find({ })
  .sort({ ClickItemId: 1 });
  
  let itemArray = [ ];
  
  for (let item of items) {
    itemArray.push({
      ClickItemId: item.ClickItemId,
      Name: item.Name,
      Description: item.Description,
      Price: item.Price,
      SWF: item.SWF,
      Data: item.Data,
      New: item.New,
      Discount: item.Discount
    })
  };
  
  return buildXML("GetClickItems", {
    ClickItem: itemArray
  });
}

/*
SORT SWF:
  1. fox
  2. dragon
  3. dog
  4. monster_boys
  5. monster_VIP
  6. monster
  7. neoplant
  8. meatester
*/