import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

async function uploadFileToS3(fileBuffer, fileName, mimeType) {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
    ACL: "public-read",
  };

  const uploadResult = await s3.upload(params).promise();
  return uploadResult.Location;
}

async function deleteFileFromS3(key) {
  if (!key) return;

  const bucket = process.env.S3_BUCKET_NAME;

  const params = {
    Bucket: bucket,
    Key: key,
  };

  await s3.deleteObject(params).promise();
  return true;
}

export { uploadFileToS3, deleteFileFromS3 };
