const { idclickitemModel, clickitemModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "SaveActorClickItemRels",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {  
  if (request.items.ActorClickItemRel.ActorClickItemRelId !== undefined) {
    for (let i in request.items.ActorClickItemRel) {
      if (isNaN(request.items.ActorClickItemRel[i] && typeof request.items.ActorClickItemRel[i] !== "string")) request.items.ActorClickItemRel[i] = "";
    };
    
    const item = await idclickitemModel.findOne({ ActorId: ActorId, ActorClickItemRelId: request.items.ActorClickItemRel.ActorClickItemRelId, IsRecycled: 0 });
    if (!item) return;
    
    let currentStage = item.Stage;
    let LastFeedTime = item.LastFeedTime;
    const check = addHours(LastFeedTime, 8);
    
    if (item.Stage == 0 && request.items.ActorClickItemRel.Stage == 1) currentStage = 1;
        
    if (request.items.ActorClickItemRel.FoodPoints != item.FoodPoints) {
      // if (new Date(new Date(addMinutes(new Date(LastFeedTime)), 480)).getTime() > Date.now()) { // make a check which checks if the pet wasnt feed before the cooldown (8 hours)
      if (Date.now() > check.getTime()) {
        let remainingPoints = request.items.ActorClickItemRel.FoodPoints % 9;
        
        if (request.items.ActorClickItemRel.FoodPoints >= 9) {
          request.items.ActorClickItemRel.FoodPoints = remainingPoints;
          
          const clickitem = await clickitemModel.findOne({ ClickItemId: item.ClickItemId });
          
          if (clickitem.MaxStage == currentStage) currentStage;
          else currentStage++;
        };
        
        LastFeedTime = new Date();
        // console.table({ currentStage, remainingPoints });
        // console.log(request.items.ActorClickItemRel.FoodPoints );
        // console.log(request.items.ActorClickItemRel.Stage )
      } else {
        request.items.ActorClickItemRel.FoodPoints = item.FoodPoints;
        // request.items.ActorClickItemRel.LastFeedTime = item.LastFeedTime; // INVALID DATE
      }
    }
    
    await idclickitemModel.updateOne({ ActorId: ActorId, ActorClickItemRelId: request.items.ActorClickItemRel.ActorClickItemRelId, IsRecycled: 0 }, {
      Stage: currentStage,
      LastFeedTime: LastFeedTime,
      Data: request.items.ActorClickItemRel.Data,
      LastWashTime: new Date(request.items.ActorClickItemRel.LastWashTime),
      FoodPoints: request.items.ActorClickItemRel.FoodPoints,
      PlayPoints: request.items.ActorClickItemRel.PlayPoints,
      x: request.items.ActorClickItemRel.x,
      y: request.items.ActorClickItemRel.y
    });
  } else {
    for (let click of request.items.ActorClickItemRel) {
      await idclickitemModel.updateOne({ ActorId: ActorId, ActorClickItemRelId: click.ActorClickItemRelId, IsRecycled: 0 }, {
        x: click.x,
        y: click.y
      });
    }
  };
  
  return buildXML("SaveActorClickItemRels");
}

function addHours(dateObj, numHours) {
  dateObj.setHours(dateObj.getHours() + numHours);
  return dateObj;
};