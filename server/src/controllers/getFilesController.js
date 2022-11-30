const UploadModel = require("../models/UploadModel");

async function getFilesController(req, res) {
  const files = await UploadModel.find();
  res.json(files);
}

module.exports = getFilesController;
