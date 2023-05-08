const { friendModel, userModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/Util.js");

exports.data = {
  SOAPAction: "GetFriendList",
  needTicket: true,
  levelModerator: 0
};

exports.run = async request => {
  const friends1 = await friendModel.find({ RequesterId: request.userId, Status: 1 });
  const friends2 = await friendModel.find({ ReceiverId: request.userId, Status: 1 });
    
  let FriendData = [ ];
    
  for(let friend of friends1) {
    FriendData.push({ int: friend.ReceiverId });
  };
  
  for(let friend of friends2) {
    FriendData.push({ int: friend.RequesterId });
  };
  
  return buildXML("GetFriendList", FriendData);
};