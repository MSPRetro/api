const { userModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "IsActorNameUsed",
  needTicket: false,
  levelModerator: 0
};

exports.run = async request => {
  const name = request.actorName.toString().trim();
  let result;
  
  const user = await userModel.findOne({ Name: name })
  .collation({ locale: "en", strength: 2 });
  
  if (new RegExp("\\bDeleted User\\b").test(name) || user) result = true;
  else result = false;
  
  return buildXML("IsActorNameUsed", result);
};