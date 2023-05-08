const { userModel } = require("../Utils/Schemas.js");
const { addFame } = require("../Utils/Util.js");
const config = require("../config.json");

exports.data = {
  Name: "castingFinished",
  Method: "POST"
}

exports.run = async (req, res) => {
  console.log(req.query);
    
  if (config.FMSToken !== req.query.Token) return res.sendStatus(403);

  console.log(req.query);

  const user = await userModel.findOne({ ActorId: parseInt(req.query.ActorId) });
  if (!user) return res.sendStatus(404);

  await addFame(user.ActorId, user, 20);
  await userModel.updateOne({ ActorId: user.ActorId }, { $set: {
    "Progression.Money": user.Progression.Money + 10,
    "Progression.Fortune": user.Progression.Fortune + 10,
  } });

  return res.sendStatus(200);
}