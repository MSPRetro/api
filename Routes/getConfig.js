const { getIPData } = require("../Utils/IPUtils.js");
const config = require("../config.json");

exports.data = {
	Name: "getConfig",
	Method: "GET"
};

exports.run = async (req, res) => {
	let forwardedIpsStr =
		req.headers["cf-connecting-ip"] ||
		req.headers["x-forwarded-for"] ||
		req.connection.remoteAddress;
	let IP = "";
	if (forwardedIpsStr) IP = forwardedIpsStr = forwardedIpsStr.split(",")[0];

	let maintenance = false;
	if (
		config.maintenance.InMaintenance &&
		!config.maintenance.AllowedIP.includes(IP)
	)
		maintenance = true;

	const { IPId, _Locked } = await getIPData(IP);

	res.json({
		version: config.AppVersion,
		maintenance: {
			status: maintenance,
			message: config.maintenance.message
		},
		IPStatus: "authorized", // Locked ? "blocked" : "authorized",
		IP: IPId,
		disclamer: config.disclamer
	});
};
