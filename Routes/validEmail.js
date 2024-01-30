const { userModel } = require("../Utils/Schemas.js");
const { addOrRemoveMoney } = require("../Utils/Util.js");

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
  
  let emailObj = {
    "Email.EmailValidated": 2,
    "Email.MoneyReceived": 1
  };
  
  if (user.Email.MoneyReceived != 1) {
    emailObj["Email.FirstEmail"] = user.Email.Email;
    await addOrRemoveMoney(user.ActorId, 300, true);
  };
  
  await userModel.updateOne({ ActorId: user.ActorId }, { $set: emailObj });
    
  res.send("Your email is now activated!");
}