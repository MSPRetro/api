const { parseString } = require("xml2js");
const fetch = require("node-fetch");
const { existsSync, mkdirSync, appendFileSync } = require("fs");
const { createHash } = require("crypto");
const { ticketModel, userModel } = require("../Utils/Schemas.js");
const { getValue, deleteValue, setValue } = require("../Utils/Globals.js");
const { parseRawXml, isModerator } = require("../Utils/Util.js");
const { setError } = require("../Utils/ErrorManager.js");
const { SOAPActions } = require("../mspretro.js");
const { getIPDatas } = require("../Utils/IPUtils.js");
const { validateTicket } = require("../Utils/Ticket.js");
const config = require("../config.json");

exports.data = {
  Name: "Service",
  Method: "POST"
}

exports.run = async (req, res) => {
  let forwardedIpsStr = req.headers["cf-connecting-ip"] || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  let IP = "";
  if (forwardedIpsStr) IP = forwardedIpsStr = forwardedIpsStr.split(",")[0];

  if (config.maintenance.InMaintenance && !config.maintenance.AllowedIP.includes(IP)) return res.sendStatus(403);
  let action;

  res.set("checksum-server", createChecksum(undefined));

  if (await getIPDatas(IP) !== "authorized") return res.sendStatus(403);
  
  try {
    let endpoint = req.header("soapaction");

    if (!endpoint) return res.sendStatus(500);
    action = endpoint.replace("http://moviestarplanet.com/", "");
    action = action.replace(new RegExp('"', "gi"), "");

    if (process.env.ChecksumEnabled === "true" && req.headers["referer"] != "https://cdn.mspretro.com/Il8Lv2VQ2FBd6GH1O0gzog7iV7nDtol9YNVqZIMX.swf") {
      const checksumClient = req.headers["checksum-client"];
      const checksumServer = createChecksum(
        JSON.stringify(req.body) /* + req.cookies.SessionId */,
        action
      );

      if (checksumClient !== checksumServer) return res.sendStatus(403);
    }
    
    let ticketData = { isValid: false, data: { ActorId: null, IP: "", Password: "" } };

    if (SOAPActions[action]) {
      let parsed = sanitize(parseRawXml(req.body));
      if (parsed === "ERROR") return res.sendStatus(500);

      let user;
      let ActorId = false;

      if (SOAPActions[action].data.needTicket) {
        let ticket;
        try {
          ticket = parsed.TicketHeader.Ticket;
        } catch {
          ticket = parsed.ticket;
        }
        
        ticketData = validateTicket(ticket);
        
        if (!ticketData.isValid) return res.sendStatus(403);

        ActorId = ticketData.data.ActorId;

        if (SOAPActions[action].data.levelModerator != 0) {
          if (!await isModerator(ActorId, false, SOAPActions[action].data.levelModerator)) return res.sendStatus(403);
          
          /*
          var modInfo = await userModel.findOne({ ActorId: ActorId });

          await fetch(config.ModLogWebhook, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              embeds: [
                {
                  author: {
                    name: "ModLog",
                    icon_url: "https://mspretro.com/assets/logo_mspretro.png",
                  },
                  title: `Moderator action invoked`,
                  thumbnail: {
                    url: `https://cdn.mspretro.com/entity-snapshots/moviestar/0/${ActorId}.jpg`,
                  },
                  description: `${modInfo.Name} (${ActorId}) executed ${action}`,
                  fields: [
                    {
                      name: "Arguments",
                      value: `\`\`\`\n${JSON.stringify(
                        parsed,
                        null,
                        2
                      )}\n\`\`\``,
                    },
                    {
                      name: "IP",
                      value: `${IP}`,
                    },
                  ],
                },
              ],
            }),
          });
          */
        }
      }

      if (config.logEveryRequest) log(ActorId, action, parsed, IP);

      const xml = await SOAPActions[action].run(parsed, ActorId, IP, ticketData.data.Password);

      if (typeof xml === "object" && xml !== null && xml.hasOwnProperty("statuscode")) {
        return res.sendStatus(xml.statuscode);
      }

      if (process.env.ChecksumEnabled === "true") {
        /*
        let cookie = req.cookies.SessionId;

        if (!globals.getValue(`${cookie}-COOKIE`)) return res.sendStatus(403);
        globals.deleteValue(`${cookie}-COOKIE`);

        cookie = Date.now() + generate({ length: 40, numbers: true });
        globals.setValue(`${cookie}-COOKIE`, true);
        */

        parseString(xml, (err, result) => {
          const json = JSON.stringify(result);
          const checksum = createChecksum(json);

          res.set("checksum-server", checksum);
        });
      }

      res.set("Content-Type", "text/xml");
      res.send(xml);
    } else {
      const parsed = parseRawXml(req.body);
      console.log(`${action} is not coded! args: ${JSON.stringify(parsed)}`);
      await setError(
        `The API requested by the game is not yet complete, but it will be fixed soon.\n\n[SOAPAction]: ${action}\n[Args]: ${JSON.stringify(
          parsed
        )}`, false
      );
      return res.sendStatus(404);
    }
  } catch (Error) {
    console.error(`[Date] ${new Date()}`);
    console.error(`[Request] ${JSON.stringify(req.body)}`);
    console.error(Error);

    await setError(
      `An error has occurred, please report it on our Discord server.\nDiscord: Join our discord server: ${
        config.discord
      }\n\n[SOAPAction]: ${action}\n[Error]: ${Error.toString()}`, false
    );
    return res.sendStatus(500);
  }
}

function log(ActorId = false, action, request, IP) {
  if (ActorId) {
    const path = `./Logs/${ActorId}`;

    if (!existsSync(path)) mkdirSync(path); // Should be moved to CreateNewUser => if the folder is created, no need to recheck every time

    appendFileSync(
      `${path}/${action}.log`,
      `[Date] ${new Date()} - [IP] ${IP} - [Request] ${JSON.stringify(
        request
      )}\n`
    );
    appendFileSync(
      `${path}/all_requests.log`,
      `[Action] ${action} - [Date] ${new Date()} - [IP] ${IP} [Request] ${JSON.stringify(
        request
      )}\n`
    );
  }
  
  appendFileSync(
    "./Logs/all_requests.log",
    `[Action] ${action} - [Date] ${new Date()} - [IP] ${IP} [ActorId] ${typeof ActorId === "number" ? ActorId : "none"} [Request] ${JSON.stringify(
      request
    )}\n`
  );
}

function createChecksum(args, action = null) {
  let sha = createHash("sha1");

  sha.update(args + action + process.env.CUSTOMCONNSTR_SaltClient);
  return sha.digest("hex");
}

function sanitize(v) {
  if (v instanceof Object) {
    for (var key in v) {
      if (/^\$/.test(key)) {
        delete v[key];
      } else {
        sanitize(v[key]);
      }
    }
  }
  return v;
}