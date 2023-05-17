const { userModel } = require("../Utils/Schemas.js");
const { buildXML, formatDate } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "MembershipStarcoinsRecieve",
  needTicket: true,
  levelModerator: 3
};

exports.run = async (request, ActorId) => {
  const user = await userModel.findOne({ ActorId: ActorId });
  
  if ([ 5, 10, 20, 40 ].includes(request.starCoins)) {
    // whell no vip
    
    await userModel.updateOne({ ActorId: ActorId }, {
      "Progression.Money": user.Progression.Money + request.starCoins,
      "Progression.Fortune": user.Progression.Fortune + request.starCoins,
      "VIP.MembershipGiftRecievedDate": new Date()
    });
  } else if ([ 25, 50, 100, 200 ].includes(request.starCoins)) {
    // whell vip
    
    await userModel.updateOne({ ActorId: ActorId }, {
      "Progression.Money": user.Progression.Money + request.starCoins,
      "Progression.Fortune": user.Progression.Fortune + request.starCoins,
      "VIP.MembershipGiftRecievedDate": new Date()
    });
  };
  
  return buildXML("MembershipStarcoinsRecieve");
};
