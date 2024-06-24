const {
	eyeModel,
	noseModel,
	mouthModel,
	clothModel
} = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "LoadDataForRegisterNewUser",
	needTicket: false,
	levelModerator: 0
};

exports.run = async () => {
	// SkinId 0 > Girl & Boy
	// SkinId 1 > Girl
	// SkinId 2 > Boy

	const eyes = await eyeModel.find({ IsHidden: 0 });
	let eyesArr = [];

	for (let eye of eyes) {
		eyesArr.push({
			EyeId: eye.EyeId,
			Name: eye.Name,
			SWF: eye.SWF,
			SkinId: eye.SkinId
		});
	}

	const noses = await noseModel.find({ IsHidden: 0 });

	let nosesArr = [];

	for (let nose of noses) {
		nosesArr.push({
			NoseId: nose.NoseId,
			Name: nose.Name,
			SWF: nose.SWF,
			SkinId: nose.SkinId
		});
	}

	const mouths = await mouthModel.find({ IsHidden: 0 });

	let mouthsArr = [];

	for (let mouth of mouths) {
		mouthsArr.push({
			MouthId: mouth.MouthId,
			Name: mouth.Name,
			SWF: mouth.SWF,
			SkinId: mouth.SkinId
		});
	}

	const clothes = await clothModel.find({ RegNewUser: 1 });

	let clothesArr = [];

	for (let clothe of clothes) {
		clothesArr.push({
			ClothesId: clothe.ClothesId,
			Name: clothe.Name,
			SWF: clothe.SWF,
			ClothesCategoryId: clothe.ClothesCategoryId,
			Price: clothe.Price,
			ShopId: clothe.ShopId,
			SkinId: clothe.SkinId,
			Filename: clothe.Filename,
			Scale: clothe.Scale,
			Vip: clothe.Vip,
			RegNewUser: clothe.RegNewUser,
			sortorder: clothe.Sortorder,
			New: clothe.New,
			Discount: clothe.Discount,
			ClothesCategory: {
				ClothesCategoryId: clothe.ClothesCategoryId,
				Name: clothe.ClothesCategoryName,
				SlotTypeId: clothe.SlotTypeId,
				SlotType: {
					SlotTypeId: clothe.SlotTypeId,
					Name: clothe.ClothesCategoryName
				}
			}
		});
	}

	return buildXML("LoadDataForRegisterNewUser", {
		eyes: {
			Eye: eyesArr
		},
		noses: {
			Nose: nosesArr
		},
		mouths: {
			Mouth: mouthsArr
		},
		clothes: {
			Cloth: clothesArr
		}
	});
};
