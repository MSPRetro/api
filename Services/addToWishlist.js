const { userModel, clothModel, idModel } = require("../Utils/Schemas.js");
const { isModerator, getNewId } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "addToWishlist",
	needTicket: true,
	levelModerator: 0
};

let wishlist;

exports.run = async (request, ActorId) => {
	const user = await userModel.findOne({ ActorId: ActorId });

	wishlist = user.Wishlist.length;

	if (wishlist == 12) return buildXML("addToWishlist", 12);

	let itemsArray = [];

	if (request.clothes.ActorClothesRel.ActorClothesRelId !== undefined) {
		itemsArray.push(await addWish(request.clothes.ActorClothesRel, user));

		return buildXML("addToWishlist", 0);
	}

	for (let clothes of request.clothes.ActorClothesRel) {
		itemsArray.push(await addWish(clothes, user));
	}

	return buildXML("addToWishlist", 0);
};

async function addWish(clothes, user) {
	if (wishlist == 12) return buildXML("addToWishlist", 12);

	const clothe = await clothModel.findOne({ ClothesId: clothes.ClothesId });
	if (!clothe) return;

	if (!(await isModerator(user.ActorId, user, 3)) && clothe.IsHidden == 1)
		return;

	let rellId = (await getNewId("rell_clothes_id")) + 1;

	if (user.Clinic.SkinSWF === "femaleskin") user.Clinic.SkinSWF = 1;
	else user.Clinic.SkinSWF = 2;

	if (user.Clinic.SkinSWF != clothe.SkinId && clothe.SkinId != 0) return;

	const rell = new idModel({
		ActorId: 0,
		ClothesRellId: rellId,
		ClothId: clothes.ClothesId,
		Colors: clothes.Color.toString(),
		x: 0,
		y: 0,
		IsWearing: 0,
		IsRecycled: 0
	});
	await rell.save();

	await userModel.updateOne(
		{ ActorId: user.ActorId },
		{
			$push: {
				Wishlist: rellId
			}
		}
	);

	wishlist++;
}

/*
{
  actorId: 2,
  clothes: {
    ActorClothesRel: {
      ActorClothesRelId: -1,
      ActorId: 2,
      ClothesId: 1365,
      Color: '0x6699cc,0xffcc00',
      IsWearing: 1,
      x: 0,
      y: 0,
      Cloth: [Object]
    }
  },
  TicketHeader: {
    Ticket: '2,1642528332131,ptNErdvakpeMNwcdbgdqK0Ak7XaC4LOzKqwy0Yig'
  }
}


{
  actorId: 2,
  clothes: { ActorClothesRel: [ [Object], [Object] ] },
  TicketHeader: {
    Ticket: '2,1642528332131,ptNErdvakpeMNwcdbgdqK0Ak7XaC4LOzKqwy0Yig'
  }
}
*/
