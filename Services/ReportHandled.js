const { reportModel } = require("../Utils/Schemas.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "ReportHandled",
  needTicket: true,
  levelModerator: 1
}

exports.run = async (request, ActorId) => {
  const report = await reportModel.findOne({ ReportId: request.reportId });
  if (!report);
  
  await reportModel.updateOne({ ReportId: request.reportId }, {
    State: 1,
    HandledDate: new Date()
  });
  
  return buildXML("ReportHandled");
};