const { userModel } = require("../Utils/Schemas.js");

exports.data = {
  Name: "validMail",
  Method: "GET"
}

exports.run = async (req, res) => {
  const token = req.query.t;
  if (!token) return res.sendStatus(404);

  const user = await userModel.findOne({ "Email.Token": token });
  if (!user) return res.send("This key doesn't exist. Maybe you have changed your e-mail?");

  if (user.Email.EmailValidated == 2) {
    res.send("Your email is already activated!");
  } else {
    await userModel.updateOne(
      { ActorId: user.ActorId },
      { $set: { "Email.EmailValidated": 2 } }
    );

    res.send("Your email is now activated!");
  }
}