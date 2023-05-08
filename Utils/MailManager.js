const { createTransport } = require("nodemailer");

exports.sendMail = async (to, subject, content) => {
  if (!mailIsValid(to)) return false;
  
  const transporter = createTransport({
    service: "gmail",
    auth: {
      user: "mspretro@gmail.com",
      pass: "chiagitrfkcplfic"
    }
  });

  transporter.sendMail({
    from: "mspretro@gmail.com",
    to: to,
    subject: subject,
    text: content
  }, function(error, info) {
    if (error) {
      return false;
    } else {
      return true;
    }
  });
};

const mailIsValid = exports.mailIsValid = mail => {
  if (/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(mail)) return true;
  else return false;
};