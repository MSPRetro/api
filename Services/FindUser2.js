const { userModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "FindUser2",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  // const users = await userModel.find({ Name: request.searchString })
  // .collation({ locale: "en", strength: 2 })
  // .skip(request.pageindex * 10)
  // .limit(10);
  
  // const users = await userModel.find({ Name: { $regex : new RegExp(request.searchString, "i") } })
  // .skip(request.pageindex * 10)
  // .limit(10);
  
  const users = await userModel.aggregate([
    { $match: {
      $expr: {
        $gt: [{ $indexOfCP: [ "$Name", request.searchString.toString() ] }, -1]
      }}
    }
  ])
  .skip(request.pageindex * 10)
  .limit(10);
  
  let ActorName = [ ];
  for (let user of users) {
    ActorName.push({ ActorId: user.ActorId, Name: user.Name });
  };
  
  const totalRecords = await userModel.aggregate([
    { $match: {
      $expr: {
        $gt: [{ $indexOfCP: [ "$Name", request.searchString.toString() ] }, -1]
      }}
    }
  ]);
    
  return buildXML("FindUser2", {
    totalRecords: totalRecords.length,
    pageindex: request.pageindex,
    pagesize: 10,
    items: {
      ActorName: ActorName
    }
  });
};