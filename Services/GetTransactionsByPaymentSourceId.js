const { transactionModel } = require("../Utils/Schemas.js");
const { formatDate } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "GetTransactionsByPaymentSourceId",
	needTicket: true,
	levelModerator: 1
};

exports.run = async (request, ActorId) => {
	const transactions = await transactionModel
		.find({
			CheckoutDone: 1,
			$or: [
				{ MobileNumber: request.paymentSourceId },
				{ CardNumber: request.CardNumber }
			]
		})
		.sort({ _id: -1 })
		.skip(request.pageindex * 12)
		.limit(12);

	let transactionsArr = [];

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
			result_code: transaction.result_code,
			content_id: transaction.content_id,
			CardNumber: transaction.CardNumber
		});
	}

	return buildXML("GetTransactionsByPaymentSourceId", {
		totalRecords: await transactionModel.countDocuments({
			CheckoutDone: 1,
			$or: [
				{ MobileNumber: request.paymentSourceId },
				{ CardNumber: request.CardNumber }
			]
		}),
		pageindex: request.pageindex,
		pagesize: 12,
		items: {
			Transaction: transactionsArr
		}
	});
};

/*
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
    */
