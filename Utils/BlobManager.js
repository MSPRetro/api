const { createReadStream } = require("fs");
const { join } = require("path");
const { containerClient } = require("../mspretro.js");

exports.uploadDefaultImg = async (inputPath, outputPath) => {
  const stream = createReadStream(join(__dirname, inputPath));
  
  const file = containerClient.getBlockBlobClient(outputPath);
  return await file.uploadStream(stream);
}

exports.uploadBase64 = async (data, path) => {
  const buffer = Buffer.from(data, "base64");
  
  const file = containerClient.getBlockBlobClient(path);
  return await file.upload(buffer, buffer.length);
}