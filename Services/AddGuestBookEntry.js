const { userModel, guestbookModel } = require("../Utils/Schemas.js");
const { buildXML, createActivity, getNewId } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "AddGuestBookEntry",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  if (request.entry.GuestbookActorId == ActorId) return;
  
  const user = await userModel.findOne({ ActorId: request.entry.GuestbookActorId });
  if (!user) return;
    
  let GuestbookEntryId = await getNewId("guestbook_id") + 1;
  
  const guestbook = new guestbookModel({
    GuestbookEntryId: GuestbookEntryId,
    AuthorActorId: ActorId,
    IsDeleted: 0,
    DateCreated: new Date(),
    GuestbookActorId: request.entry.GuestbookActorId,
    Body: request.entry.Body
  });
  await guestbook.save();
  
  await createActivity(ActorId, 6, 0, request.entry.GuestbookActorId, 0, 0);
  
  return buildXML("AddGuestBookEntry");
};