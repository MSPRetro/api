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
  
  const token = generate({ length: 64, numbers: true });
  
  await userModel.updateOne({ ActorId: ActorId }, { $set: {
    "Email.Email": request.email,
    "Email.Token": token,
    "Email.EmailSettings": request.emailSettings,
    "Email.EmailValidated": 1
  } });
  
  if (!await sendMail("verify", request.email, user.Name, "Valid your email on MSPRetro", `Hello ${user.Name},\n\ngreetings!\nPlease click on the link to valid your email, and get $300 free StarCoins.\nLink: https://api.mspretro.com/validEmail?a=${ActorId}&t=${token}\n\nBest regards,\nThe MSPRetro team`)) return buildXML("SendEmailValidation", false); 
  else return buildXML("SendEmailValidation", true);
}

// chaxlgiw9E21+hod+z4f