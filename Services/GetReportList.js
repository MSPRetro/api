const { userModel, reportModel } = require("../Utils/Schemas.js");
const { formatDate } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "GetReportList",
  needTicket: true,
  levelModerator: 1
}

exports.run = async (request, ActorId) => {
  let State;
  if (request.onlyGetNotHandled) State = 0;
  else State = 1;
    
  const reports = await reportModel.find({ State: State })
    .sort({ _id: -1 })
    .skip(request.pageindex * 10)
    .limit(10);
  
  let reportArray = [ ];
  
  for (let report of reports) {
    const userComplainer = await userModel.findOne({ ActorId: report.ComplainerActorId });
    const userReported = await userModel.findOne({ ActorId: report.ReportedActorId });
    
    reportArray.push({
      ReportId: report.ReportId,
      ComplainerActorId: report.ComplainerActorId,
      ReportedActorId: report.ReportedActorId,
      MovieId: report.MovieId,
      Comment: report.Comment,
      ReportedDate: formatDate(report.ReportedDate),
      HandledDate: formatDate(new Date(0)),
      Conclusion: "",
      ComplainerActor: {
        ActorId: userComplainer.ActorId,
        Name: userComplainer.Name
      },
      ReportedActor: {
        ActorId: userReported.ActorId,
        Name: userReported.Name
      }
    });
  };
  
  return buildXML("GetReportList", {
    totalRecords: await reportModel.countDocuments({ State: State }),
    pageindex: request.pageindex,
    pagesize: 10,
    items: {
      ReportReader: reportArray
    }
  });
};