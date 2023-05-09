const { hostname } = require("os");

exports.data = {
  Name: "worker",
  Method: "GET"
}

exports.run = (req, res) => {
  return res.send(`Server: ${hostname()} - Worker: ${process.pid}`);
}