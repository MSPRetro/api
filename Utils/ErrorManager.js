const { errorModel } = require("./Schemas.js");
const { randomBytes } = require("crypto");

const defaultError =
	"An error occured, but we couldn't figure out where did something went wrong. Please report it to the administrators.";
const errorArray = [];

exports.setError = async (error, sendEvent = true, info = {}) => {
	if (sendEvent)
		process.send({ msg: "setErrorInvoked", data: { err: error } });

	if (info.moderator) {
		errorArray.push({ errorId: null, error: "No permission." });
		return;
	}

	const version = Buffer.alloc(1).toString("hex");
	const traceId = randomBytes(16).toString("hex");
	const id = randomBytes(8).toString("hex");
	const flags = "01";

	const errorId = `${version}-${traceId}-${id}-${flags}`;

	if (sendEvent) {
		const doc = new errorModel({
			errorId,
			error,
			timestamp: Date.now()
		});
		await doc.save();
	}

	errorArray.push({ errorId, error });
};

exports.getError = () => {
	if (errorArray.length == 0) return defaultError;
	return errorArray[errorArray.length - 1];
};

exports.clearError = (sendEvent = true) => {
	if (sendEvent) process.send({ msg: "deleteErrorInvoked" });
	errorArray.pop();
};
