const { createReadStream } = require("fs");
const { join } = require("path");
const { containerClient } = require("../mspretro.js");

exports.uploadDefaultImg = async (inputPath, outputPath) => {
	const stream = createReadStream(join(__dirname, inputPath));

	try {
		const file = containerClient.getBlockBlobClient(outputPath);
		await file.uploadStream(stream);
	} catch {}
};

exports.uploadBase64 = async (data, path) => {
	const buffer = Buffer.from(data, "base64");

	try {
		const file = containerClient.getBlockBlobClient(path);
		await file.upload(buffer, buffer.length);
	} catch {}
};
