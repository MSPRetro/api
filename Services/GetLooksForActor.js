const { lookModel } = require("../Utils/Schemas.js");
const { formatDate } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "GetLooksForActor",
	needTicket: true,
	levelModerator: 0
};

exports.run = async (request, ActorId) => {
	let looks;

	if (request.orderBy === "likes")
		looks = await lookModel.aggregate([
			{ $match: { ActorId: request.actorId, State: 0 } },
			{ $addFields: { len: { $size: "$Likes" } } },
			{ $sort: { len: -1 } },
			{ $skip: request.pageindex * 3 },
			{ $limit: 3 }
		]);
	else if (request.orderBy === "sells")
		looks = await lookModel.aggregate([
			{ $match: { ActorId: request.actorId, State: 0 } },
			{ $addFields: { len: { $size: "$Sells" } } },
			{ $sort: { len: -1 } },
			{ $skip: request.pageindex * 3 },
			{ $limit: 3 }
		]);
	else
		looks = await lookModel
			.find({ ActorId: request.actorId, State: 0 })
			.sort({ _id: -1 })
			.skip(request.pageindex * 3)
			.limit(3);

	let looksArray = [];

	for (let look of looks) {
		let LookActorLike = {};

		if (look.Likes.includes(ActorId))
			LookActorLike = {
				LookActorLike: {
					EntityType: 2,
					EntityId: look.ActorId,
					ActorId: ActorId
				}
			};

		looksArray.push({
			LookId: look.LookId,
			ActorId: look.ActorId,
			Created: formatDate(look.Created),
			Headline: look.Headline,
			LookData: look.LookData,
			Likes: look.Likes.length,
			Sells: look.Sells.length,
			LookActorLikes: LookActorLike
		});
	}

	return buildXML("GetLooksForActor", {
		totalRecords: await lookModel.countDocuments({
			ActorId: request.actorId,
			State: 0
		}),
		pageindex: request.pageindex,
		pagesize: 3,
		items: {
			Look: looksArray
		}
	});
};

/*
    <s:element name="GetLooksForActorResponse">
        <s:complexType>
            <s:sequence>
                <s:element minOccurs="0" name="GetLooksForActorResult" type="tns:PagedLookList"/>
            </s:sequence>
        </s:complexType>
    </s:element>
    <s:complexType name="PagedLookList">
        <s:sequence>
            <s:element name="totalRecords" type="s:int"/>
            <s:element name="pageindex" type="s:int"/>
            <s:element name="pagesize" type="s:int"/>
            <s:element minOccurs="0" name="items" type="tns:ArrayOfLook"/>
        </s:sequence>
    </s:complexType>
    <s:complexType name="ArrayOfLook">
        <s:sequence>
            <s:element maxOccurs="unbounded" minOccurs="0" name="Look" nillable="true" type="tns:Look"/>
        </s:sequence>
    </s:complexType>
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
        </s:sequence>
    </s:complexType>
    <s:complexType name="ArrayOfLookActorLike">
        <s:sequence>
            <s:element maxOccurs="unbounded" minOccurs="0" name="LookActorLike" nillable="true" type="tns:LookActorLike"/>
        </s:sequence>
    </s:complexType>
    <s:complexType name="LookActorLike">
        <s:sequence>
            <s:element name="EntityType" type="s:int"/>
            <s:element name="EntityId" nillable="true" type="s:int"/>
            <s:element name="ActorId" type="s:int"/>
        </s:sequence>
    */
