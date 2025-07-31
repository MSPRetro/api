const { hostname } = require("node:os");

exports.data = {
	Name: "",
	Method: "GET"
};

exports.run = (_, res) => {
	res.send(`Server: ${hostname()} - Worker: ${process.pid}`);
};
