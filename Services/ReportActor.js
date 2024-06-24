const { userModel, movieModel, reportModel } = require("../Utils/Schemas.js");
const { getNewId } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "ReportActor",
	needTicket: true,
	levelModerator: 0
};

exports.run = async (request, ActorId) => {
	if (
		isNaN(
			request.report.Comment && typeof request.report.Comment !== "string"
		)
	)
		request.report.Comment = "";

	if (!(await userModel.findOne({ ActorId: request.report.ReportedActorId })))
		return;
	if (
		request.report.MovieId !== 0 &&
		!(await movieModel.findOne({ MovieId: request.report.MovieId }))
	)
		return;

	let ReportId = (await getNewId("report_id")) + 1;

	const report = new reportModel({
		ReportId: ReportId,
		ComplainerActorId: ActorId,
		ReportedActorId: request.report.ReportedActorId,
		MovieId: request.report.MovieId,
		Comment: request.report.Comment,
		State: 0,
		ReportedDate: new Date(),
		HandledDate: new Date(0),
		Conclusion: ""
	});
	await report.save();

	return buildXML("ReportActor");
};
