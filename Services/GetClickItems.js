const { clickitemModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetClickItems",
  needTicket: false,
  levelModerator: 0
};

exports.run = async request => {
  /*
  
  const items = await clickitemModel.find({ });
  
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
  */
  
  return buildXML("GetClickItems", {
    ClickItem: [
      {
        ClickItemId: 4,
        Name: "Fox",
        Description: "Fox",
        Price: 900,
        SWF: "fox",
        Data: "",
        New: 0,
        Discount: 0
      },
      {
        ClickItemId: 4,
        Name: "Fox",
        Description: "Fox",
        Price: 900,
        SWF: "fox",
        Data: "",
        New: 0,
        Discount: 0
      },
      {
        ClickItemId: 5,
        Name: "Dog",
        Description: "Dog",
        Price: 900,
        SWF: "dog",
        Data: "",
        New: 0,
        Discount: 0
      },
      {
        ClickItemId: 8,
        Name: "Meat Eater",
        Description: "Meat Eater",
        Price: 450,
        SWF: "meateater",
        Data: "",
        New: 0,
        Discount: 0
      },
      {
        ClickItemId: 3,
        Name: "VIP Boonie",
        Description: "VIP Boonie",
        Price: 900,
        SWF: "monster_VIP",
        Data: "",
        New: 0,
        Discount: 0
      },
      {
        ClickItemId: 2,
        Name: "Dark Side Boonie",
        Description: "boy monster description",
        Price: 900,
        SWF: "monster_boys",
        Data: "",
        New: 0,
        Discount: 0
      },
      {
        ClickItemId: 1,
        Name: "Light Side Boonie",
        Description: "description of monster",
        Price: 900,
        SWF: "monster",
        Data: "",
        New: 0,
        Discount: 0
      },
      {
        ClickItemId: 7,
        Name: "Dragon",
        Description: "Dragon",
        Price: 900,
        SWF: "dragon",
        Data: "",
        New: 0,
        Discount: 0
      }
    ]
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