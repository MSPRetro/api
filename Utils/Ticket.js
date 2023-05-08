const { createHash } = require("crypto");

exports.generateTicket = actorId => {
  let ticketDate = new Date();
  ticketDate.setHours(ticketDate.getHours() + 24);
  ticketDate = ticketDate.getTime();
  
  return `RETRO,${actorId},${ticketDate},${calculateSha256(actorId + ticketDate.toString())}`;
};

exports.validateTicket = ticket => {
  let ticketSeparated = ticket.split(",");
  
  if (ticketSeparated.length != 4) return false;
  
  const actorId = ticketSeparated[1];
  const dateTime = ticketSeparated[2];
  const ticketHash = ticketSeparated[3];

  if (calculateSha256(actorId + dateTime) !== ticketHash) return false;
  
  if (Date.now() > Number(dateTime)) return false;
  
  return true;
}

function calculateSha256(data) {
  let hash = createHash("sha256");
  
  hash.update(data + process.env.CUSTOMCONNSTR_TicketSalt);
  return hash.digest("base64");
}