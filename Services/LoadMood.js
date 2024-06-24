const { userModel } = require("../Utils/Schemas.js");
const { buildXML, buildXMLnull } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "LoadMood",
	needTicket: false,
	levelModerator: 0
};

exports.run = async request => {
	const user = await userModel.findOne({ ActorId: request.actorId });
	if (!user) return;

	if (user.Mood.TextLine.length == 0) return buildXMLnull("LoadMood");

	return buildXML("LoadMood", {
		ActorId: user.ActorId,
		FigureAnimation: user.Mood.FigureAnimation,
		FaceAnimation: user.Mood.FaceAnimation,
		MouthAnimation: user.Mood.MouthAnimation, // ActorClickItemRelId with the current ActorId
		TextLine: user.Mood.TextLine,
		SpeechLine: false // always set it to false.
	});
};
