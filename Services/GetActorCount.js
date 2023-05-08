const { buildXML } = require("../Utils/Util.js");
const { userModel } = require("../Utils/Schemas.js");

exports.data = {
  SOAPAction: "GetActorCount",
  needTicket: false,
  levelModerator: 0
};

exports.run = async () => {
  return buildXML("GetActorCount", await userModel.countDocuments({ "Extra.IsExtra": 0 }));
};
