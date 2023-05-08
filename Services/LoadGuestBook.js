const { userModel, guestbookModel } = require("../Utils/Schemas.js");
const { buildXML, formatDate } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "LoadGuestBook",
  needTicket: true,
  levelModerator: 0
};

exports.run = async (request, ActorId) => {
  const user = await userModel.findOne({ ActorId: request.userId });
  if (!user) return;
  
  const comments = await guestbookModel.find({ GuestbookActorId: request.userId, IsDeleted: 0 })
  .sort({ _id: -1 })
  .skip(request.pageindex * 3)
  .limit(3);
  
  let guestbook = [ ];
  
  for(let comment of comments) {
    const Actor = await userModel.findOne({ ActorId: comment.AuthorActorId });
    
    guestbook.push({
      GuestbookEntryId: comment.GuestbookEntryId,
      AuthorActorId: comment.AuthorActorId,
      DateCreated: formatDate(comment.DateCreated),
      GuestbookActorId: user.ActorId,
      Subject: "",
      Body: comment.Body,
      Actor: {
        ActorId: Actor.ActorId,
        Name: Actor.Name        
      },
      GuestBookActor: {
        ActorId: user.ActorId,
        Name: user.Name
      }
    })
  };
  
  return buildXML("LoadGuestBook", {
    totalRecords: await guestbookModel.countDocuments({ GuestbookActorId: request.userId, IsDeleted: 0 }),
    pageindex: request.pageindex,
    pagesize: 3,
    items: {
      GuestbookEntry: guestbook
    }
  });
    
  /*
    <s:complexType name="PagedGuestBookEntryList">
        <s:sequence>
            <s:element name="totalRecords" type="s:int"/>
            <s:element name="pageindex" type="s:int"/>
            <s:element name="pagesize" type="s:int"/>
            <s:element minOccurs="0" name="items" type="tns:ArrayOfGuestbookEntry"/>
        </s:sequence>
    </s:complexType>
    <s:complexType name="ArrayOfGuestbookEntry">
        <s:sequence>
            <s:element maxOccurs="unbounded" minOccurs="0" name="GuestbookEntry" nillable="true" type="tns:GuestbookEntry"/>
        </s:sequence>
    </s:complexType>
    <s:complexType name="GuestbookEntry">
        <s:sequence>
            <s:element name="GuestbookEntryId" type="s:int"/>
            <s:element name="AuthorActorId" type="s:int"/>
            <s:element name="DateCreated" nillable="true" type="s:dateTime"/>
            <s:element name="GuestbookActorId" type="s:int"/>
            <s:element minOccurs="0" name="Subject" type="s:string"/>
            <s:element minOccurs="0" name="Body" type="s:string"/>
            <s:element minOccurs="0" name="Actor" type="tns:GuestBookActor"/>
            <s:element minOccurs="0" name="GuestBookActor" type="tns:GuestBookActor"/>
        </s:sequence>
    </s:complexType>
    <s:complexType name="GuestBookActor">
        <s:sequence>
            <s:element name="ActorId" type="s:int"/>
            <s:element minOccurs="0" name="Name" type="s:string"/>
        </s:sequence>
    </s:complexType>
  */
};
