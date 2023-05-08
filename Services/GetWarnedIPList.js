const { IPModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetWarnedIPList",
  needTicket: true,
  levelModerator: 2
};

exports.run = async (request, ActorId) => {
  const warns = await IPModel.find({ Locked: request.showBlocked })
  .sort({ Warns: -1 })
  .skip(request.pageindex * 10)
  .limit(10);
  
  let IPListItem = [ ];
  
  for (let warn of warns) {
    IPListItem.push({
      ipasint: warn.IPId,
      cnt: warn.Warns
    });
  };
  
  return buildXML("GetWarnedIPList", {
    totalRecords: await IPModel.countDocuments({ Locked: request.showBlocked }),
    pageindex: request.pageindex,
    pagesize: 10,
    items: {
     IPListItem: IPListItem
    }
  });
}