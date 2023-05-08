const { transactionModel } = require("../Utils/Schemas.js");
const { buildXML, formatDate, isModerator } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetTransactions",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  if (request.userId != ActorId && !await isModerator(ActorId, false, 1)) return;
  
  const transactions = await transactionModel.find({ ActorId: request.userId, CheckoutDone: 1 })
  .sort({ _id: -1 })
  .skip(request.pageindex * 12)
  .limit(12);
  
  let transactionsArr = [ ];
  
  for (let transaction of transactions) {
    transactionsArr.push({
      TransactionId: transaction.TransactionId,
      ActorId: transaction.ActorId,
      Amount: transaction.Amount,
      Currency: transaction.Currency,
      MobileNumber: transaction.MobileNumber,
      trx_id: transaction.TransactionId,
      Timestamp: formatDate(transaction.Timestamp),
      StarCoinsBefore: transaction.StarCoinsBefore,
      StarCoinsAfter: transaction.StarCoinsAfter,
      result_code: transaction.result_code, // 0 => Paid, 1 => Not Paid
      content_id: transaction.content_id,
      CardNumber: transaction.CardNumber
    })
  }
  
  return buildXML("GetTransactions", {
    totalRecords: await transactionModel.countDocuments({ ActorId: request.userId, CheckoutDone: 1 }),
    pageindex: request.pageindex,
    pagesize: 12,
    items: {
      Transaction: transactionsArr
    }
  });
};

/*
<s:complexType name="PagedTransactionList">
        <s:sequence>
            <s:element name="totalRecords" type="s:int"/>
            <s:element name="pageindex" type="s:int"/>
            <s:element name="pagesize" type="s:int"/>
            <s:element minOccurs="0" name="items" type="tns:ArrayOfTransaction"/>
        </s:sequence>
    </s:complexType>
    <s:complexType name="ArrayOfTransaction">
        <s:sequence>
            <s:element maxOccurs="unbounded" minOccurs="0" name="Transaction" nillable="true" type="tns:Transaction"/>
        </s:sequence>
    </s:complexType>
    <s:complexType name="Transaction">
        <s:sequence>
            <s:element name="TransactionId" type="s:int"/>
            <s:element name="ActorId" nillable="true" type="s:int"/>
            <s:element name="Amount" nillable="true" type="s:int"/>
            <s:element minOccurs="0" name="Currency" type="s:string"/>
            <s:element minOccurs="0" name="MobileNumber" type="s:string"/>
            <s:element minOccurs="0" name="trx_id" type="s:string"/>
            <s:element name="Timestamp" nillable="true" type="s:dateTime"/>
            <s:element name="StarCoinsBefore" nillable="true" type="s:int"/>
            <s:element name="StarCoinsAfter" nillable="true" type="s:int"/>
            <s:element name="result_code" nillable="true" type="s:int"/>
            <s:element minOccurs="0" name="content_id" type="s:string"/>
            <s:element minOccurs="0" name="CardNumber" type="s:string"/>
        </s:sequence>
    </s:complexType>
    
    switch (_local_3.content_id)
                {
                    case "1000":
                        return (resourceManager.getString("myResources", "1WEEK_500"));
                    case "2000":
                        return (resourceManager.getString("myResources", "1WEEK_VIP") + " + 750 StarCoins");
                    case "3000":
                        return (resourceManager.getString("myResources", "2WEEKS_VIP") + " + 2.000 StarCoins");
                    case "6000":
                        return (resourceManager.getString("myResources", "1MONTH_VIP") + " + 6.000 StarCoins");
                    case "14000":
                        return (resourceManager.getString("myResources", "3MONTHS_VIP") + " + 15.000 StarCoins");
                    case "2001":
                        return ("1.000 StarCoins");
                    case "3001":
                        return ("2.500 StarCoins");
                    case "6001":
                        return ("7.500 StarCoins");
                    case "14001":
                        return ("20.000 StarCoins");
                    default:
                        return (_local_3.content_id);
                };
    */