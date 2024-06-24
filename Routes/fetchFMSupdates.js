const { getValue, setValue } = require("../Utils/Globals.js");

exports.data = {
	Name: "fetchFMSupdates",
	Method: "GET"
};

exports.run = (req, res) => {
	let fmsUpdates = getValue("fmsUpdates");

	if (fmsUpdates == undefined) {
		setValue("fmsUpdates", {});
		return res.send(`&`);
	}

	let joined = Object.keys(fmsUpdates)
		.map(function (key) {
			return key + "=" + fmsUpdates[key];
		})
		.join("&");

	res.send(`&${joined}`);

	setValue("fmsUpdates", {});
};
