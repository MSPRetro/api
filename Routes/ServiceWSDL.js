const { join } = require("path");
const { readFileSync } = require("fs");

exports.data = {
  Name: "Service",
  Method: "GET"
}

exports.run = (req, res) => {  
  // if (req.query && req.query.wsdl === "") {
  res.set("Content-Type", "text/xml");
  
  return res.send(readFileSync(join(__dirname, "../wsdl.xml")));
  
  
    // return res.send(readFileSync("../wsdl.xml", "utf-8"));
  // }
  
  // return res.send("");
}