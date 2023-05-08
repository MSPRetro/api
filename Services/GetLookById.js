const { lookModel } = require("../Utils/Schemas.js");
const { buildXML, formatDate } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetLookById",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  const look = await lookModel.findOne({ LookId: request.lookId, State: 0 });
  if (!look) return;
  
  let LookActorLike = { };
  
  if (look.Likes.includes(ActorId)) LookActorLike = {
    LookActorLike: {
      EntityType: 2,
      EntityId: look.ActorId,
      ActorId: ActorId
    }
  };
  
  return buildXML("GetLookById", {
    LookId: look.LookId,
    ActorId: look.ActorId,
    Created: formatDate(look.Created),
    Headline: look.Headline,
    LookData: look.LookData,
    Likes: look.Likes.length,
    Sells: look.Sells.length,
    LookActorLikes: LookActorLike
  });
};


/*
   <s:element name="GetLookById">
        <s:complexType>
            <s:sequence>
                <s:element name="lookId" type="s:int"/>
                <s:element name="likeActorId" type="s:int"/>
            </s:sequence>
        </s:complexType>
    </s:element>
    <s:element name="GetLookByIdResponse">
        <s:complexType>
            <s:sequence>
                <s:element minOccurs="0" name="GetLookByIdResult" type="tns:Look"/>
            </s:sequence>
        </s:complexType>
    </s:element>
    <s:complexType name="Look">
        <s:sequence>
            <s:element name="LookId" nillable="true" type="s:int"/>
            <s:element name="ActorId" type="s:int"/>
            <s:element name="Created" type="s:dateTime"/>
            <s:element minOccurs="0" name="Headline" type="s:string"/>
            <s:element minOccurs="0" name="LookData" type="s:base64Binary"/>
            <s:element name="Likes" type="s:int"/>
            <s:element name="Sells" type="s:int"/>
            <s:element minOccurs="0" name="LookActorLikes" type="tns:ArrayOfLookActorLike"/>
                <s:complexType name="LookActorLike">
        <s:sequence>
            <s:element name="EntityType" type="s:int"/>
            <s:element name="EntityId" nillable="true" type="s:int"/>
            <s:element name="ActorId" type="s:int"/>
        </s:sequence>
    </s:complexType>
    */