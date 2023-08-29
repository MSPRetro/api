const { userModel, transactionModel } = require("../Utils/Schemas.js");
const { addDays, addOrRemoveMoney, getCurrencySymbol, numStr } = require("../Utils/Util.js");
const { sendMail } = require("../Utils/MailManager.js");
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
    
  const productData = getProductByKey(transaction.content_id);
  const user = await userModel.findOne({ ActorId: transaction.ActorId });
  
  if (productData.amountVIPDays != 0) {
    let timeout = new Date(user.VIP.MembershipTimeoutDate).getTime();
    
    if (timeout == 0 || Date.now() > timeout) timeout = new Date(addDays(new Date(), productData.amountVIPDays++));
    else timeout = new Date(addDays(user.VIP.MembershipTimeoutDate, productData.amountVIPDays++));

    await userModel.updateOne({ ActorId: user.ActorId }, { $set: {
      "VIP.MembershipTimeoutDate": timeout,
      "VIP.MembershipGiftRecievedDate": new Date(),
      "VIP.TotalVipDays": user.VIP.TotalVipDays + productData.amountVIPDays--
    } });
  }
    
  await addOrRemoveMoney(user.ActorId, productData.amountStarCoins);
  
  await transactionModel.updateOne({ TransactionId: transaction.TransactionId }, {
    CheckoutDone: 1,
    StarCoinsBefore: user.Progression.Money,
    StarCoinsAfter: user.Progression.Money + productData.amountStarCoins,
    result_code: 0,
    CardNumber: 0
  });
  
  const currencyData = getCurrencySymbol(event.data.object.currency.toUpperCase());
  
  await sendMail(event.data.object.customer_details.email, `Order #${transaction.TransactionId}: Payment confirmed`, `Hello ${user.Name},\nthank you for your support! We hope you enjoy your purchase.\n\nOverview of your order:\n  Order ID: #${transaction.TransactionId}\n  Product: ${productData.description}\n  Subtotal: ${currencyLeftOrRight(currencyData, event.data.object.amount_subtotal / 100)}\n  Total: ${currencyLeftOrRight(currencyData, event.data.object.amount_total / 100)}\n  Amount of StarCoins before: ${numStr(user.Progression.Money, ".")}\n  Amount of StarCoins after: ${numStr(user.Progression.Money + productData.amountStarCoins, ".")}\n\nIf you have any questions or problems with this purchase, you can reply directly to this email for assistance.\n\nGreetings,\nThe MSPRetro team`, process.env.CUSTOMCONNSTR_TrustpilotEmail);
  
  res.sendStatus(200);
}

function getProductByKey(key) {
  switch (key) {
    case "1000":
    case "2000": // 1 week VIP
      return {
        amountVIPDays: 8,
        amountStarCoins: 1000,
        description: "1 week VIP + 1.000 StarCoins"
      }
    
    case "3000": // 1 month VIP
      return {
        amountVIPDays: 31,
        amountStarCoins: 5000,
        description: "1 month VIP + 5.000 StarCoins"
      }
    
    case "6000": // 1 year VIP
      return {
        amountVIPDays: 366,
        amountStarCoins: 100000,
        description: "1 year VIP + 100.000 StarCoins"
      }
    
    case "14000": // 3 months VIP
      return {
        amountVIPDays: 91,
        amountStarCoins: 20000,
        description: "3 months VIP + 20.000 StarCoins"
      }

    case "2001": // $10.000 StarCoins
      return {
        amountVIPDays: 0,
        amountStarCoins: 10000,
        description: "10.000 StarCoins"
      }
    
    case "3001": // $50.000 StarCoins
      return {
        amountVIPDays: 0,
        amountStarCoins: 50000,
        description: "50.000 StarCoins"
      }
    
    case "6001": // $400.000 StarCoins
      return {
        amountVIPDays: 0,
        amountStarCoins: 400000,
        description: "400.000 StarCoins"
      }
    
    case "14001": // $1.000.000 StarCoins
      return {
        amountVIPDays: 0,
        amountStarCoins: 1000000,
        description: "1.000.000 StarCoins"
      }
  }
}

function currencyLeftOrRight(currencyData, price) {
  if (currencyData.orientation === "L") return currencyData.symbol + price;
  else return price + currencyData.symbol;
}