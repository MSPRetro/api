const { buildXML } = require("../Utils/XML.js");
const { errorModel } = require("../Utils/Schemas.js");
const { randomBytes } = require("crypto");
const { getError, clearError } = require("../Utils/ErrorManager.js");

exports.data = {
  SOAPAction: "GetLatestServerException",
  needTicket: false,
  levelModerator: 0
};

exports.run = () => {
  const error = getError();
  clearError();
  
  // console.log(error);
  let message = error.errorId === null ? error.error : `An error occured.\nTrace parent ID: ${error.errorId}\n\nPlease report the trace parent ID to the administrators if you think this error isn't legitimate (check MSPRetro website to know if it's a disabled feature).`;
  
  return buildXML("GetLatestServerException", message);
};