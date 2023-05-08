const { idclickitemModel } = require("../Utils/Schemas.js");
const { buildXML, formatDate } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetClickItemsForActor",
  needTicket: true,
  levelModerator: 0
};

exports.run = async request => {
  const items = await idclickitemModel.find({ ActorId: request.actorId, IsRecycled: 0 })
  .sort({ _id: -1 });
  
  let itemsArray = [ ];
  
  for (let item of items) {
    itemsArray.push({
      ActorClickItemRelId: item.ActorClickItemRelId,
      ActorId: item.ActorId,
      ClickItemId: item.ClickItemId,
      FoodPoints: item.FoodPoints,
      Stage: item.Stage,
      Name: item.Name,
      LastFeedTime: formatDate(item.LastFeedTime, true),
      Data: item.Data,
      x: item.x,
      y: item.y,
      LastWashTime: formatDate(item.LastWashTime, true),
      PlayPoints: item.PlayPoints
    });
  };
  
  return buildXML("GetClickItemsForActor", {
    ActorClickItemRel: itemsArray
  });
};