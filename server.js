require("dotenv").config();
const express = require("express");
const AWS = require("aws-sdk");
const cors = require("cors");
const fs = require("fs-extra");
const path = require("path");

const app = express();
app.use(cors());

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const bucketName = process.env.AWS_BUCKET_NAME;

const skipFirstNFiles = 0; // Adjust this value to skip the first N files

async function listAllObjects() {
  let isTruncated = true;
  let continuationToken = null;
  let allObjects = [];

  while (isTruncated) {
    const params = {
      Bucket: bucketName,
      MaxKeys: 1000,
      ContinuationToken: continuationToken, // Use for pagination
    };

    const data = await s3.listObjectsV2(params).promise();
    allObjects.push(...data.Contents);

    isTruncated = data.IsTruncated;
    continuationToken = data.NextContinuationToken;
  }

  return allObjects;
}

app.get("/download-all", async (req, res) => {
  const tempDir = path.join(__dirname, "temp");
  const zipPath = path.join(__dirname, "s3_files.zip");

  try {
    await fs.emptyDir(tempDir); // Clear temp folder

    // Fetch file list from S3
    const filesToDownload = await listAllObjects();

    console.log(`Total objects in bucket: ${filesToDownload.length}`);

    if (skipFirstNFiles > 0) {
      if (filesToDownload.length <= skipFirstNFiles) {
        console.log("No new files to download.");
        return;
      }

      filesToDownload = filesToDownload.slice(skipFirstNFiles); // Skip the first N files
    }

    console.log(`Downloading ${filesToDownload.length} remaining files...`);

    // Download each file
    for (let file of filesToDownload) {
      const filePath = path.join(tempDir, file.Key); // Preserve directory structure
      await fs.ensureDir(path.dirname(filePath)); // Ensure parent directories exist

      const fileStream = fs.createWriteStream(filePath);
      const s3Stream = s3
        .getObject({ Bucket: bucketName, Key: file.Key })
        .createReadStream();

      s3Stream.pipe(fileStream);

      s3Stream.on("error", (err) => console.error("S3 Stream Error:", err));
      fileStream.on("error", (err) => console.error("File Stream Error:", err));

      await new Promise((resolve) => fileStream.on("finish", resolve));
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
