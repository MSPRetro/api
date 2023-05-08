const { idAnimationModel, animationModel, userModel, idclickitemModel } = require("../Utils/Schemas.js");
const { buildXML, createActivity } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "SetMood",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  for (let i in request.mood) {
    if (isNaN(request.mood[i] && typeof request.mood[i] !== "string")) request.mood[i] = "";
  };
  
  if (![ "neutral", "happy", "angry", "sad", "surprised" ].includes(request.mood.FaceAnimation)) return; 
  if (![ "stand", "talk", "Wave", "walk", "stand up", "Run", "Sidewave", "Sittingonchair", "Sittingthefloor", "lying down", "Layingonside", "Sidedance1", "dance4", "jump2", "sidejump2", "Handgesture1", "I am Cool", "punch", "kick", "fall", "zombiewalk", "ide", "scared" ].includes(request.mood.FigureAnimation)) {
    const animation = await animationModel.findOne({ Filename: request.mood.FigureAnimation });

    if (!idAnimationModel.findOne({ AnimationId: animation.AnimationId })) return;
  };

  if (request.mood.MouthAnimation !== "none" && !await idclickitemModel.findOne({ ActorId: ActorId, ActorClickItemRelId: request.mood.MouthAnimation })) return;
  
  await userModel.updateOne({ ActorId: ActorId }, { $set: {
    "Mood.FigureAnimation": request.mood.FigureAnimation,
    "Mood.FaceAnimation": request.mood.FaceAnimation,
    "Mood.MouthAnimation": request.mood.MouthAnimation, // ActorClickItemRelId with the current ActorId
    "Mood.TextLine": request.mood.TextLine
  }});

  await createActivity(ActorId, 3, 0, 0, 0, 0);

  return buildXML("SetMood");
};
