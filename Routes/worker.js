exports.data = {
  Name: "worker",
  Method: "GET"
}

exports.run = (req, res) => {
  return res.send("Worker: " + process.pid);
}