const { userModel, transactionModel } = require("../Utils/Schemas.js");
const { buildXML, isModerator, numStr, getNewId } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "awardActorMoney",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  let user = await userModel.findOne({ ActorId: ActorId });
  
  if (!await isModerator(ActorId, user, 3)) {
     if (user.Extra.AwardMoney != 0) return buildXML("awardActorMoney");
    
     await userModel.updateOne({ ActorId: request.actorId }, { $set: {
       "Progression.Money": user.Progression.Money + 200,
       "Progression.Fortune": user.Progression.Fortune + 200,
       "Extra.AwardMoney": 1
     }});
  } else {
    user = await userModel.findOne({ ActorId: request.actorId });
  
    await userModel.updateOne({ ActorId: request.actorId }, { $set: { "Progression.Money": user.Progression.Money + request.amount } });
    
    let TransactionId = await getNewId("transaction_id") + 1;
    
    const transaction = new transactionModel({
      TransactionId: TransactionId,
      StripeId: "",
      CheckoutDone: 1,
      ActorId: request.actorId,
      Amount: 0,
      Currency: "£",
      MobileNumber: "0",
      Timestamp: new Date(),
      StarCoinsBefore: user.Progression.Money,
      StarCoinsAfter: user.Progression.Money + request.amount,
      result_code: 1,
      content_id: `MANUAL - ${numStr(request.amount, ".")} StarCoins`,
      CardNumber: 0
    });
    await transaction.save();
  };
  
  return buildXML("awardActorMoney");
};