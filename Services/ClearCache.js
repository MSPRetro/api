const fetch = require("node-fetch");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "ClearCache",
  needTicket: true,
  levelModerator: 3
};

exports.run = async () => {
  await fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CloudflareZone}/purge_cache`, {
    body: "{\"purge_everything\":true}",
    headers: {
      "Content-Type": "application/json",
      "X-Auth-Email": process.env.CUSTOMCONNSTR_CloudflareEmail,
      "X-Auth-Key": process.env.CUSTOMCONNSTR_CloudflareKey
    },
    method: "POST"
  });
  
  return buildXML("ClearCache");
}