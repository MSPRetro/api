const { join } = require("path");
const fs = require("node:fs");
const path = require("path");

exports.uploadDefaultImg = async (inputPath, outputPath) => {
	try {
		if (!process.env.CDN_PATH) {
			console.warn("CDN_PATH environment variable is not set.");
			return;
		}

		const dir = path.dirname(join(process.env.CDN_PATH, outputPath));

		// this shouldn't throw an error if path was already found
		fs.mkdirSync(dir, { recursive: true });

		const input = fs.createReadStream(join(__dirname, inputPath));
		const output = fs.createWriteStream(
			join(process.env.CDN_PATH, outputPath)
		);

		input.pipe(output);
	} catch (e) {
		console.error("Failed to upload default image:", e);
	}
};

exports.uploadBase64 = async (data, outputPath) => {
	try {
		const buffer = Buffer.from(data, "base64");

		if (!process.env.CDN_PATH) {
			console.warn("CDN_PATH environment variable is not set.");
			return;
		}

		const dir = path.dirname(join(process.env.CDN_PATH, outputPath));

		// this shouldn't throw an error if path was already found
		fs.mkdirSync(dir, { recursive: true });

		fs.writeFileSync(join(process.env.CDN_PATH, outputPath), buffer, {
			encoding: "binary"
		});
	} catch (e) {
		console.error("Failed to upload base64 encoded buffer:", e);
	}
};
