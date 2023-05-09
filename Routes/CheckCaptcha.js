const fetch = require("node-fetch");

exports.data = {
  Name: "CheckCaptcha",
  Method: "POST"
}

exports.run = async (req, res) => {
  const verifiedCaptcha = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CaptchaKey}&response=${req.body.captcha["g-captcha-response"]}`, {
    method: "POST"
  })
  .then(res => res.json())
  .then(json => json.success);
}