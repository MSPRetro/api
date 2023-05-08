const { generate } = require("generate-password");
const { sendMail, mailIsValid } = require("../Utils/MailManager.js");
const { userModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "SendEmailValidation",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  if (!mailIsValid(request.email)) return buildXML("SendEmailValidation", false);
  
  const user = await userModel.findOne({ ActorId });
  if (user.Email.FirstEmail !== "") return;
  
  const token = `${ActorId},${generate({ length: 16, numbers: true })}`;
  
  await userModel.updateOne({ ActorId: ActorId }, { $set: { "Email.Email": request.email, "Email.FirstEmail": request.email, "Email.Token": token, "Email.EmailValidated": 1 } });
  
  if (!await sendMail(request.email, "Valid your E-Mail on MSP Retro", `Hello ${user.Name},\nwe hope you enjoy the game!\nPlease click on the link to valid your mail, and get $300 starcoins. Link: https://api.mspretro.com/validMail?t=${token}\n\nSee you soon!\nAdmin`)) return buildXML("SendEmailValidation", false); 
  else return buildXML("SendEmailValidation", true);
}

// chaxlgiw9E21+hod+z4f