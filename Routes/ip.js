exports.data = {
	Name: "ip",
	Method: "GET"
};

exports.run = (req, res) => {
	let forwardedIpsStr =
		req.headers["cf-connecting-ip"] ||
		req.headers["x-forwarded-for"] ||
		req.connection.remoteAddress;
	let IP = "";

	if (forwardedIpsStr) IP = forwardedIpsStr = forwardedIpsStr.split(",")[0];
	res.send(IP);
};
