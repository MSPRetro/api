const { userModel } = require("../Utils/Schemas.js");

exports.data = {
  Name: "validEmail",
  Method: "GET"
}

exports.run = async (req, res) => {
  const ActorId = parseInt(req.query.a);
  const token = req.query.t;
  
  if (!token || !ActorId || isNaN(ActorId)) return res.sendStatus(404);

  const user = await userModel.findOne({ ActorId, "Email.Token": token });
  if (!user) return res.send("This key doesn't exist. Perhaps you've changed your email in the meantime?");

  if (user.Email.EmailValidated == 2) return res.send("You've already confirmed your email!");
  
  if (user.Email.MoneyReceived != 1) {
    await userModel.updateOne({ ActorId: user.ActorId }, { $set: {
      "Email.EmailValidated": 2,
      "Email.MoneyReceived": 1,
      "Progression.Money": user.Progression.Money + 300,
      "Progression.Fortune": user.Progression.Fortune + 300
    } });
  } else {
    await userModel.updateOne({ ActorId: user.ActorId }, { $set: {
      "Email.EmailValidated": 2
    } });
  }
  
  res.send("Your email is now activated!");
}