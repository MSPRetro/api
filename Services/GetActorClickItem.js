const { idclickitemModel } = require("../Utils/Schemas.js");
const { buildXML, formatDate } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetActorClickItem",
  needTicket: true,
  levelModerator: 0
};

exports.run = async request => {
  const item = await idclickitemModel.findOne({ ActorClickItemRelId: request.actorClickItemRelId });
  if (!item) return;
  
  return buildXML("GetActorClickItem", {
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