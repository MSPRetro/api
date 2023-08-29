const { run } = require("./SendEmailValidation.js");
const { userModel, eyeModel, noseModel, mouthModel } = require("../Utils/Schemas.js");
const { buildXML, createActivity, addOrRemoveMoney, addFame } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "SaveActorDetails",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {  
  for (let i in request.data) {
    if (isNaN(request.data[i] && typeof request.data[i] !== "string")) request.data[i] = "";
  };
  
  const user = await userModel.findOne({ ActorId: ActorId });
  if (user.Clinic.EyeId !== request.data.EyeId || user.Clinic.EyeColors !== request.data.EyeColors) await buyClinic(ActorId, "EyeId", request.data.EyeId, request.data.EyeColors);
  if (user.Clinic.NoseId !== request.data.NoseId) await buyClinic(ActorId, "NoseId", request.data.NoseId, null);
  if (user.Clinic.MouthId !== request.data.MouthId || user.Clinic.MouthColors !== request.data.MouthColors) await buyClinic(ActorId, "MouthId", request.data.MouthId, request.data.MouthColors);
  if (user.Clinic.SkinColor !== request.data.SkinColor) await buyClinic(ActorId, "SkinColor", null, request.data.SkinColor);
  
  if (request.data.Email !== user.Email.Email) await run({ email: request.data.Email }, ActorId);
  
  await userModel.updateOne({ ActorId: ActorId }, { $set: {
    "Email.EmailSettings": request.data.EmailSettings,
    "Profile.ProfileText": request.data.ProfileText,
    "Favorites.FavoriteMovie": request.data.FavoriteMovie,
    "Favorites.FavoriteActor": request.data.FavoriteActor,
    "Favorites.FavoriteActress": request.data.FavoriteActress,
    "Favorites.FavoriteSinger": request.data.FavoriteSinger,
    "Favorites.FavoriteSong": request.data.FavoriteSong
  }});
  
  await createActivity(ActorId, 4, 0, 0, 0, 0);
  
  return buildXML("SaveActorDetails");
};

async function buyClinic(ActorId, type, id, colors) {
  let user = await userModel.findOne({ ActorId: ActorId });
  
  if (user.Clinic.SkinSWF === "femaleskin") user.Clinic.SkinSWF = 1;
  else user.Clinic.SkinSWF = 2;
  
  if (800 > user.Progression.Money) return;
  
  switch (type) {
    case "EyeId":
      const eye = await eyeModel.findOne({ EyeId: id });
      if (eye.SkinId != user.Clinic.SkinSWF && eye.SkinId != 0) return;
      
      await userModel.updateOne({ ActorId: ActorId }, { $set: {
        "Clinic.EyeId": id,
        "Clinic.EyeColors": colors
      }});
      
      break;
    case "NoseId":
      const nose = await noseModel.findOne({ NoseId: id });
      if (nose.SkinId != user.Clinic.SkinSWF && nose.SkinId != 0) return;
      
      await userModel.updateOne({ ActorId: ActorId }, { $set: {
        "Clinic.NoseId": id
      }});
      
      break;
    case "MouthId":
      const mouth = await mouthModel.findOne({ MouthId: id });
      if (mouth.SkinId != user.Clinic.SkinSWF && mouth.SkinId != 0) return;
      
      await userModel.updateOne({ ActorId: ActorId }, { $set: {
        "Clinic.MouthId": id,
        "Clinic.MouthColors": colors
      }});
            
      break;
    case "SkinColor":
      await userModel.updateOne({ ActorId: ActorId }, { $set: {
        "Clinic.SkinColor": colors
      }});
            
      break;
  }
  
  await addOrRemoveMoney(ActorId, -800);
  await addFame(ActorId, user, 80);
  
  return;
}