const { buildXML } = require("../Utils/XML.js");

exports.data = {
  SOAPAction: "ActiveLocales",
  needTicket: false,
  levelModerator: 0
};

exports.run = () => {
  return buildXML("ActiveLocales", {
    string: "en_US"
  });
}