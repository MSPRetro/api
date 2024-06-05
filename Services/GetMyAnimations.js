const { buildXML } = require("../Utils/XML.js");
const { idAnimationModel, animationModel } = require("../Utils/Schemas.js");

exports.data = {
  SOAPAction: "GetMyAnimations",
  needTicket: false,
  levelModerator: 0
};

exports.run = async request => {
  const animations = await idAnimationModel.find({ ActorId: request.actorId });
  
  let animationsArr = [ ];
  
  for (let animationActor of animations) {
    const animation = await animationModel.findOne({ AnimationId: animationActor.AnimationId });
    
    animationsArr.push({
      ActorAnimationRelId: animationActor.AnimationRellId,
      ActorId: request.actorId,
      AnimationId: animationActor.AnimationId,
      Animation: {
        AnimationId: animation.AnimationId,
        Name: animation.Name,
        FrameLabel: animation.Filename,
        AnimationCategoryId: animation.CategoryId,
        LevelId: 0,
        Price: animation.Price,
        Vip: animation.Vip,
        Deleted: animation.IsHidden,
        New: animation.New,
        Discount: animation.Discount,
        AnimationCategory: {
          AnimationCategoryId: animation.CategoryId,
          Name: animation.CategoryName
        }
      }
    });
  };
  
  return buildXML("GetMyAnimations", {
    ActorAnimationRel: animationsArr
  });
};