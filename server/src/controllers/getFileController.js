const s3 = require("../libs/s3");

async function getFileController(req, res) {
  const data = await s3
    .getObject({
      Key: req.params.filename,
      Bucket: process.env.BUCKET_NAME,
    })
    .promise();
  res.attachment(req.params.filename);
  res.type(data.ContentType);
  res.send(data.Body);
}

module.exports = getFileController;
