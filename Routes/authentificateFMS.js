const { IPModel, ticketModel } = require("../Utils/Schemas.js");

exports.data = {
  Name: "authentificateFMS",
  Method: "GET"
}

exports.run = async (req, res) => {
  res.set("Content-Type", "text/plain; charset=UTF-8");

  let ActorId = req.query.ActorId;
  const IP = req.query.IP;

  if (!ActorId || !IP || isNaN(ActorId)) return res.sendStatus(403);
  ActorId = parseInt(ActorId);

  const IPDatas = await IPModel.findOne({ IP: IP });
  if (!IPDatas) return res.sendStatus(403);

  const user = await ticketModel.findOne({ ActorId: ActorId, IPId: IPDatas.IPId, Disable: false })
  .sort({ _id: -1 });

  if (!user || user.Date < Date.now()) return res.sendStatus(403);
  else return res.sendStatus(200);
  
  // res.send("&actorID=" + req.params.actorID);
}