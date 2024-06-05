const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "UpdateGift",
  needTicket: true,
  levelModerator: 0
};

exports.run = () => {
  // the gift need to be an object
  
  return buildXML("UpdateGift", {
    swf: "/swf/bottoms/Honey_bottoms_10_boys.swf",
    Name: "Hello!"
  });
};