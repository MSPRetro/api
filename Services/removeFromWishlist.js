const { userModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "removeFromWishlist",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  await userModel.updateOne({ ActorId: ActorId }, { $pull: {
    Wishlist: request.giftId
  }});
  
  return buildXML("removeFromWishlist");
}