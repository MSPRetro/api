const { generate } = require("generate-password");
const { pbkdf2Sync } = require("crypto");
const { setValue } = require("../Utils/Globals.js");
const { sendMail, mailIsValid } = require("../Utils/MailManager.js");
const { userModel, ticketModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "RecoverUserFromEmailHistory",
  needTicket: false,
  levelModerator: 0
};

exports.run = async request => {
  const user = await userModel.findOne({ Name: new RegExp("\\b" + request.actorName + "\\b", "i") });
  if (!user) return buildXML("RecoverUserFromEmailHistory", 0);

  if (user.Email.FirstEmail === "" || user.Email.FirstEmail !== request.email) return buildXML("RecoverUserFromEmailHistory", 0);
  
  const password = generate({ length: 8, numbers: true });
  
  await userModel.updateOne({ ActorId: user.ActorId }, {
    Password: pbkdf2Sync(`MSPRETRO,${password}`, process.env.CUSTOMCONNSTR_SaltDB, 1000, 64, "sha512").toString("hex"),
    $set: { "Email.Email": request.email }
  });
  
  await ticketModel.updateMany({ ActorId: user.ActorId, Disable: false }, { Disable: true });
  setValue(`${user.ActorId}-PASSWORD`, password);
  
  if (await sendMail(request.email, "Email and password recovery", `Hello ${user.Name},\nwe have received a request to change your password and your email. If you have not done so, please log in again with your new password, and change your email.\nNew email: ${request.email}\nNew password: ${password}\n\nSee you soon!\nAdmin`)) return buildXML("RecoverUserFromEmailHistory", -1); 
  else return buildXML("RecoverUserFromEmailHistory", 1);
  
  // -1 : An error has occured
  // 1 : Password sent
};