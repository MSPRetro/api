const { lookModel } = require("../Utils/Schemas.js");
const { createActivity, getNewId } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "SaveLook",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  let lookId;
  
  if (request.look.LookId != 0) {
    const look = await lookModel.findOne({ LookId: request.look.LookId, State: 0 });
    if (!look) return;
    
    lookId = look.LookId;
    await lookModel.updateOne({ LookId: request.look.LookId, ActorId: ActorId }, { Headline: request.look.Headline });
  } else {
    lookId = await getNewId("look_id") + 1;

    const look = new lookModel({
      LookId: lookId,
      ActorId: ActorId,
      Created: new Date(),
      State: 0,
      Headline: request.look.Headline,
      LookData: request.look.LookData,
      Likes: [ ],
      Sells: [ ]
    });
    await look.save();

    await createActivity(ActorId, 9, 0, 0, 0, lookId);
  };
  
  return buildXML("SaveLook", lookId);
};