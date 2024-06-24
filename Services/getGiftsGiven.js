const {
	userModel,
	giftModel,
	idModel,
	clothModel
} = require("../Utils/Schemas.js");
const { formatDate } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "getGiftsGiven",
	needTicket: true,
	levelModerator: 0
};

exports.run = async (request, ActorId) => {
	const gifts = await giftModel
		.find({ SenderActorId: ActorId })
		.sort({ _id: -1 })
		.skip(request.pageindex * 6)
		.limit(6);

	const user = await userModel.findOne({ ActorId: ActorId });

	let giftsArr = [];

	for (let gift of gifts) {
		const userGiver = await userModel.findOne({
			ActorId: gift.SenderActorId
		});
		const relCloth = await idModel.findOne({
			ClothesRellId: gift.ClothesRellId
		});
		const cloth = await clothModel.findOne({ ClothesId: relCloth.ClothId });

		giftsArr.push({
			GiftLogId: gift.GiftId,
			ActorId: ActorId,
			actorName: user.Name,
			GiverId: gift.SenderActorId,
			giverName: userGiver.Name,
			ClothesId: cloth.ClothesId,
			clothesName: cloth.Name,
			Color: relCloth.Colors,
			SWF: cloth.SWF,
			Filename: cloth.Filename,
			Vip: cloth.Vip,
			Price: cloth.Price,
			ClothesCategoryId: cloth.ClothesCategoryId,
			Shopid: 1,
			dateStr: formatDate(new Date())
		});
	}

	return buildXML("getGiftsGiven", {
		totalRecords: await giftModel.countDocuments({
			SenderActorId: ActorId
		}),
		pageindex: request.pageindex,
		pagesize: 6,
		items: {
			GiftLogItem: giftsArr
		}
	});
};

/*
    <s:complexType name="PagedGiftLogList">
        <s:sequence>
            <s:element name="totalRecords" type="s:int"/>
            <s:element name="pageindex" type="s:int"/>
            <s:element name="pagesize" type="s:int"/>
            <s:element minOccurs="0" name="items" type="tns:ArrayOfGiftLogItem"/>
        </s:sequence>
    </s:complexType>
    <s:complexType name="ArrayOfGiftLogItem">
        <s:sequence>
            <s:element maxOccurs="unbounded" minOccurs="0" name="GiftLogItem" nillable="true" type="tns:GiftLogItem"/>
        </s:sequence>
    </s:complexType>
    <s:complexType name="GiftLogItem">
        <s:sequence>
            <s:element name="GiftLogId" type="s:int"/>
            <s:element name="ActorId" type="s:int"/>
            <s:element minOccurs="0" name="actorName" type="s:string"/>
            <s:element name="GiverId" type="s:int"/>
            <s:element minOccurs="0" name="giverName" type="s:string"/>
            <s:element name="ClothesId" type="s:int"/>
            <s:element minOccurs="0" name="clothesName" type="s:string"/>
            <s:element minOccurs="0" name="Color" type="s:string"/>
            <s:element minOccurs="0" name="SWF" type="s:string"/>
            <s:element minOccurs="0" name="Filename" type="s:string"/>
            <s:element name="Vip" nillable="true" type="s:int"/>
            <s:element name="Price" type="s:int"/>
            <s:element name="ClothesCategoryId" type="s:int"/>
            <s:element name="Shopid" nillable="true" type="s:int"/>
            <s:element minOccurs="0" name="dateStr" type="s:string"/>
        </s:sequence>
    </s:complexType>
    
    
    exports.giftModel = model(
  "gifts",
  new Schema({
    GiftId: Number,
    SenderActorId: Number,
    ReceiverActorId: Number,
    ClothesRellId: Number,
    State: Number, // 0 : Not open / 1 : Open
    SWF: String
  })
);
  */
