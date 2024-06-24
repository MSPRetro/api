const { userModel, idModel, clothModel } = require("../Utils/Schemas.js");
const { buildPage } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "getWishlist",
	needTicket: true,
	levelModerator: 0
};

exports.run = async request => {
	const user = await userModel.findOne({ ActorId: request.actorId });
	if (!user) return;

	let wishsArray = [];

	for (let ClothesRellId of user.Wishlist) {
		const relCloth = await idModel.findOne({
			ClothesRellId: ClothesRellId
		});
		const clothe = await clothModel.findOne({
			ClothesId: relCloth.ClothId
		});

		wishsArray.push({
			GiftId: ClothesRellId,
			ActorId: user.ActorId,
			actorName: user.Name,
			ClothesId: clothe.ClothesId,
			clothesName: clothe.clothesName,
			Color: relCloth.Colors,
			SWF: clothe.SWF,
			Filename: clothe.Filename,
			Vip: clothe.Vip,
			Price: clothe.Price,
			ClothesCategoryId: clothe.ClothesCategoryId,
			Shopid: clothe.Shopid
		});
	}

	let totalRecords = wishsArray.length;
	wishsArray = buildPage(request.pageindex, 6, wishsArray.reverse());

	return buildXML("getWishlist", {
		totalRecords: totalRecords,
		pageindex: request.pageindex,
		pagesize: 6,
		items: {
			WishlistItem: wishsArray
		}
	});
};

/*
    <s:element name="getWishlist">
        <s:complexType>
            <s:sequence>
                <s:element name="actorId" type="s:int"/>
                <s:element name="pageindex" type="s:int"/>
                <s:element name="pagesize" type="s:int"/>
            </s:sequence>
        </s:complexType>
    </s:element>
    <s:element name="getWishlistResponse">
        <s:complexType>
            <s:sequence>
                <s:element minOccurs="0" name="getWishlistResult" type="tns:PagedWishlist"/>
            </s:sequence>
        </s:complexType>
    </s:element>
    <s:complexType name="PagedWishlist">
        <s:sequence>
            <s:element name="totalRecords" type="s:int"/>
            <s:element name="pageindex" type="s:int"/>
            <s:element name="pagesize" type="s:int"/>
            <s:element minOccurs="0" name="items" type="tns:ArrayOfWishlistItem"/>
        </s:sequence>
    </s:complexType>
    <s:complexType name="ArrayOfWishlistItem">
        <s:sequence>
            <s:element maxOccurs="unbounded" minOccurs="0" name="WishlistItem" nillable="true" type="tns:WishlistItem"/>
        </s:sequence>
    </s:complexType>
    <s:complexType name="WishlistItem">
        <s:sequence>
            <s:element name="GiftId" type="s:int"/>
            <s:element name="ActorId" type="s:int"/>
            <s:element minOccurs="0" name="actorName" type="s:string"/>
            <s:element name="ClothesId" type="s:int"/>
            <s:element minOccurs="0" name="clothesName" type="s:string"/>
            <s:element minOccurs="0" name="Color" type="s:string"/>
            <s:element minOccurs="0" name="SWF" type="s:string"/>
            <s:element minOccurs="0" name="Filename" type="s:string"/>
            <s:element name="Vip" nillable="true" type="s:int"/>
            <s:element name="Price" type="s:int"/>
            <s:element name="ClothesCategoryId" type="s:int"/>
            <s:element name="Shopid" nillable="true" type="s:int"/>
        </s:sequence>
    </s:complexType>
  */
