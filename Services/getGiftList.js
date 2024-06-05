const { userModel, giftModel, idModel, clothModel } = require("../Utils/Schemas.js");
const { formatDate } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "getGiftList",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  const gifts = await giftModel.find({ ReceiverActorId: ActorId, State: 0 });
  const user = await userModel.findOne({ ActorId: ActorId });
  
  let giftsArr = [ ];
  
  for (let gift of gifts) {
    const userGiver = await userModel.findOne({ ActorId: gift.SenderActorId });
    const relCloth = await idModel.findOne({ ClothesRellId: gift.ClothesRellId });
    const cloth = await clothModel.findOne({ ClothesId: relCloth.ClothId });
    
    giftsArr.push({
      GiftId: gift.GiftId,
      ActorId: ActorId,
      GiverId: gift.SenderActorId,
      ClothesId: cloth.ClothesId,
      Color: relCloth.Colors,
      State: gift.State,
      SWF: gift.SWF,
      Price: cloth.Price,
      dateStr: formatDate(new Date()),
      actorClothesRelId: relCloth.ClothesRellId,
      Actor: {
        ActorId: user.ActorId,
        Name: user.Name,
      },
      Giver: {
        ActorId: userGiver.ActorId,
        Name: userGiver.Name
      }
    });
  }
  
  return buildXML("getGiftList", {
    Gift: giftsArr
  });
};


/*
    <s:complexType name="ArrayOfGift">
        <s:sequence>
            <s:element maxOccurs="unbounded" minOccurs="0" name="Gift" nillable="true" type="tns:Gift"/>
        </s:sequence>
    </s:complexType>
    <s:complexType name="Gift">
        <s:sequence>
            <s:element name="GiftId" type="s:int"/>
            <s:element name="ActorId" type="s:int"/>
            <s:element name="GiverId" nillable="true" type="s:int"/>
            <s:element name="ClothesId" type="s:int"/>
            <s:element minOccurs="0" name="Color" type="s:string"/>
            <s:element name="State" type="s:int"/>
            <s:element minOccurs="0" name="SWF" type="s:string"/>
            <s:element name="Price" type="s:int"/>
            <s:element minOccurs="0" name="dateStr" type="s:string"/>
            <s:element name="actorClothesRelId" nillable="true" type="s:int"/>
            <s:element minOccurs="0" name="Actor" type="tns:GiftActorName"/>
            <s:element minOccurs="0" name="Giver" type="tns:GiftActorName"/>
        </s:sequence>
    </s:complexType>
    <s:complexType name="GiftActorName">
        <s:sequence>
            <s:element name="ActorId" type="s:int"/>
            <s:element minOccurs="0" name="Name" type="s:string"/>
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