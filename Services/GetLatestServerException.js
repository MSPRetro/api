const { buildXML } = require("../Utils/Util.js");
const { errorModel } = require("../Utils/Schemas.js");
const { randomBytes } = require("crypto");
const { getError, clearError } = require("../Utils/ErrorManager.js");
const { discord } = require("../config.json");

exports.data = {
  SOAPAction: "GetLatestServerException",
  needTicket: false,
  levelModerator: 0
};

exports.run = () => {
  const error = getError();
  clearError();
  
  // console.log(error);
  let message = error.errorId === null ? error.error : `An error occured.\nTrace parent ID: ${error.errorId}\n\nCreate a ticket and report it in our Discord Server: ${discord}`;
  
  return buildXML("GetLatestServerException", message);
};