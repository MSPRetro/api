const { parseString } = require("xml2js");
const { promises } = require("fs");
const { createHash } = require("crypto");
const { parseRawXml, isModerator } = require("../Utils/Util.js");
const { setError } = require("../Utils/ErrorManager.js");
const { SOAPActions } = require("../mspretro.js");
const { getIPData } = require("../Utils/IPUtils.js");
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
  
  const { Locked } = await getIPData(IP);

  if (Locked) return res.sendStatus(403);
  
  try {
    let endpoint = req.header("soapaction");

    if (!endpoint) return res.sendStatus(500);
    action = endpoint.replace("http://moviestarplanet.com/", "");
    action = action.replace(new RegExp('"', "gi"), "");

    if (process.env.ChecksumEnabled === "true") {
      const checksumClient = req.headers["checksum-client"];
      const checksumServer = createChecksum(JSON.stringify(req.body), action);

      if (checksumClient !== checksumServer) return res.sendStatus(403);
    }
    
    let ticketData = { isValid: false, data: { ActorId: null, IP: "", Password: "" } };

    if (SOAPActions[action]) {
      let parsed = sanitize(parseRawXml(req.body));
      if (parsed === "ERROR") return res.sendStatus(500);

      let user;
      let ticket;
      let ActorId = false;

      if (SOAPActions[action].data.needTicket) {
        try {
          ticket = parsed.TicketHeader.Ticket;
        } catch {
          ticket = parsed.ticket;
        }
        
        ticketData = validateTicket(ticket);
        if (!ticketData.isValid) return res.sendStatus(403);

        ActorId = ticketData.data.ActorId;

        if (SOAPActions[action].data.levelModerator != 0 && !await isModerator(ActorId, false, SOAPActions[action].data.levelModerator)) return res.sendStatus(403);
      }

      if (process.env.LogEveryRequest === "true") await log(ActorId, action, redactTicket(parsed, ticket), IP);

      const xml = await SOAPActions[action].run(parsed, ActorId, IP, ticketData.data.Password);

      if (typeof xml === "object" && xml !== null && xml.hasOwnProperty("statuscode")) {
        return res.sendStatus(xml.statuscode);
      }

      if (process.env.ChecksumEnabled === "true") {
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
      console.log(`${action} is not coded! args: ${JSON.stringify(parsed)}`); // if a ticket exists, it is not redacted
      
      await setError(`The API requested by the game is not yet complete, but it will be fixed soon.\n\n[SOAPAction]: ${action}\n[Args]: ${JSON.stringify(parsed)}`, false);
      return res.sendStatus(404);
    }
  } catch (Error) {
    console.error(`[Date] ${new Date()}`);
    console.error(`[Request] ${JSON.stringify(req.body)}`);
    console.error(Error);

    await setError(`An error has occurred, please report it to the administrators.\n\n[SOAPAction]: ${action}\n[Error]: ${Error.toString()}`, false);
    return res.sendStatus(500);
  }
}

async function log(ActorId = false, action, redactedReq, IP) {
  if (ActorId) {
    const path = `./Logs/${ActorId}`;
    
    try {
      await promises.mkdir(path); // Should be moved to CreateNewUser => if the folder is created, no need to recheck every time
      
      // user's logs
      await promises.appendFile(`${path}/${action}.log`, `[Date] ${new Date()} - [IP] ${IP} - [Request] ${redactedReq}\n`);
      await promises.appendFile(`${path}/all_requests.log`, `[Action] ${action} - [Date] ${new Date()} - [IP] ${IP} [Request] ${redactedReq}\n`);
    } catch (error) {
      if (error.code !== "EEXIST") {
        throw error;
      }
    }
  }
  
  // global logs
  await promises.appendFile("./Logs/all_requests.log", `[Action] ${action} - [Date] ${new Date()} - [IP] ${IP} [ActorId] ${typeof ActorId === "number" ? ActorId : "none"} [Request] ${redactedReq}\n`);
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

function redactTicket(request, ticket) {
  // regex to match the ticket?
  if (ticket) return JSON.stringify(request).replaceAll(ticket, "REDACTED");
  
  return request;
}