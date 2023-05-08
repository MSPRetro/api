const fetch = require("node-fetch");
const { buildXML } = require("../Utils/Util.js");
const { cloudflare } = require("../config.json");

exports.data = {
  SOAPAction: "ClearCache",
  needTicket: true,
  levelModerator: 3
};

exports.run = async () => {
  await fetch(`https://api.cloudflare.com/client/v4/zones/${cloudflare.zone}/purge_cache`, {
    body: "{\"purge_everything\":true}",
    headers: {
      "Content-Type": "application/json",
      "X-Auth-Email": cloudflare.email,
      "X-Auth-Key": cloudflare.key
    },
    method: "POST"
  });
  
  return buildXML("ClearCache");
}