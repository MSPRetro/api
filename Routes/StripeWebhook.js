const { userModel, transactionModel } = require("../Utils/Schemas.js");
const { addDays } = require("../Utils/Util.js")
const stripe = require("stripe");

exports.data = {
  Name: "StripeWebhook",
  Method: "POST"
}

exports.run = async (req, res) => {
  const signature = req.header("stripe-signature");
  if (!signature) return res.sendStatus(404);
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.CUSTOMCONNSTR_StripeWebhook);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  const transaction = await transactionModel.findOne({ StripeId: event.data.object.id });
  if (!transaction) return res.sendStatus(404);
  
  let amountVIPDays = amountStarCoins = 0;
  
  switch (transaction.content_id) {
    case "1000":
    case "2000": // 1 week VIP
      amountVIPDays = 8;
      amountStarCoins = 1000;

      break;
    case "3000": // 1 month VIP
      amountVIPDays = 31;
      amountStarCoins = 5000;
      
      break;
    case "6000": // 1 year VIP
      amountVIPDays = 366;
      amountStarCoins = 100000;

      break;
    case "14000": // 3 months VIP
      amountVIPDays = 91;
      amountStarCoins = 20000;

      break;
    case "2001": // $5.000 StarCoins
      amountStarCoins = 5000;
      
      break;
    case "3001": // $50.000 StarCoins
      amountStarCoins = 50000;
      
      break;
    case "6001": // $400.000 StarCoins
      amountStarCoins = 400000;
      
      break;
    case "14001": // $1.000.000 StarCoins
      amountStarCoins = 1000000;
      
      break;
      // return ("20.000 StarCoins");
  }
  
  const user = await userModel.findOne({ ActorId: transaction.ActorId });
  
  if (amountVIPDays != 0) {
    let timeout = new Date(user.VIP.MembershipTimeoutDate).getTime();
    
    if (timeout == 0 || Date.now() > timeout) timeout = new Date(addDays(new Date(), amountVIPDays++));
    else timeout = new Date(addDays(user.VIP.MembershipTimeoutDate, amountVIPDays++));

    await userModel.updateOne({ ActorId: user.ActorId }, { $set: {
      "VIP.MembershipTimeoutDate": timeout,
      "VIP.MembershipGiftRecievedDate": new Date(),
      "VIP.TotalVipDays": user.VIP.TotalVipDays + amountVIPDays--
    } });
  }
  
  await userModel.updateOne({ ActorId: user.ActorId }, { $set: {
    "Progression.Money": user.Progression.Money + amountStarCoins
  } });
  
  await transactionModel.updateOne({ TransactionId: transaction.TransactionId }, {
    CheckoutDone: 1,
    StarCoinsBefore: user.Progression.Money,
    StarCoinsAfter: user.Progression.Money + amountStarCoins,
    result_code: 0,
    CardNumber: 0
  });
  
  res.sendStatus(200);
}