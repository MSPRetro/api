const { generate } = require("generate-password");
const { pbkdf2Sync } = require("crypto");
const { setValue } = require("../Utils/Globals.js");
const { sendMail, mailIsValid } = require("../Utils/MailManager.js");
const { userModel, ticketModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "ForgotPassword",
  needTicket: false,
  levelModerator: 0
};

exports.run = async request => {
  const user = await userModel.findOne({ Name: new RegExp("\\b" + request.actorName + "\\b", "i") });
  if (!user) return buildXML("ForgotPassword", 0);
  
  if (user.Email.EmailValidated != 2) return buildXML("ForgotPassword", 3);
  if (user.Email.Email !== request.email) return buildXML("ForgotPassword", 2);
  
  const password = generate({ length: 8, numbers: true });
  
  await userModel.updateOne({ ActorId: user.ActorId }, {
    Password: pbkdf2Sync(`MSPRETRO,${password}`, process.env.CUSTOMCONNSTR_SaltDB, 1000, 64, "sha512").toString("hex")
  });
  
  await ticketModel.updateMany({ ActorId: user.ActorId, Disable: false }, { Disable: true });
  setValue(`${user.ActorId}-PASSWORD`, password);
  
  if (await sendMail(request.email, "Password recovery", `Hello ${user.Name},\n\ngreetings!\nWe have received a request to change your password. If you have not done so, please log in again with your new password, and change your email.\nNew password: ${password}\n\nBest regards,\nThe MSPRetro team`)) return buildXML("ForgotPassword", -1); 
  else return buildXML("ForgotPassword", 1);
  
  // -1 : An error has occured
  // 1 : Password sent
};