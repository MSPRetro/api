const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "GetAppSetting",
  needTicket: true,
  levelModerator: 0
};

exports.run = request => {
  switch (request.key) {
    case "FMSAppName":
      return buildXML("GetAppSetting", process.env.URIFMS);
  }
};
