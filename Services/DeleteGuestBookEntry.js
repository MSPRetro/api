const { guestbookModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "DeleteGuestBookEntry",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  await guestbookModel.updateOne({ GuestbookEntryId: request.entry.GuestbookEntryId, GuestbookActorId: ActorId }, { $set: { IsDeleted: 1 } });
    
  return buildXML("DeleteGuestBookEntry");
};