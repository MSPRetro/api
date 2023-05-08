const { setError } = require("../Utils/ErrorManager.js");
const { discord } = require("../config.json");

exports.data = {
  SOAPAction: "GetBokuBuyUrl",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  await setError(`MSP Retro is a free game, meaning you aren’t able to buy any additional StarCoins nor VIP Membership.\nPlease join our discord server to see how to gain VIP membership. ${discord}`);
  
  return { statuscode: 500 };
}