const { userModel } = require("../Utils/Schemas.js");

exports.data = {
	Name: "admin/getActorIdByName",
	Method: "GET"
};

exports.run = async (req, res) => {
	const apiKey = req.header("x-api-key");
	if (!apiKey) return res.status(404).end();

	// if x-api-key doesn't match or environment variable isn't set
	if (apiKey !== process.env.ADMIN_API_KEY || !process.env.ADMIN_API_KEY)
		return res.status(404).end();

	const name = req.query["name"];
	if (!name) return res.status(400).end();

	const user = await userModel.findOne({ Name: name });
	if (!user) return res.status(404).end();

	return res.json({ actorId: user.ActorId });
};
