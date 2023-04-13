const express = require("express");
const cors = require("cors");
const googleDrive = require("gdurl");
const axios = require("axios");
const app = express();
const fs = require("fs");
const crypto = require("crypto");

const videoLinksPath = "./videoLinks.json";
const videoLinks = JSON.parse(fs.readFileSync(videoLinksPath, "utf8"));
app.use(cors());
app.use(express.json());
app.get("/proxy-video/:uniqueId", async (req, res) => {
  try {
    const { uniqueId } = req.params;

    const videoData = videoLinks[uniqueId];
    if (!videoData) {
      return res.status(404).send("Video not found");
    }

    try {
      const videoResponse = await axios.get(videoData.src, {
        responseType: "stream",
      });

      res.setHeader("Content-Type", videoResponse.headers["content-type"]);
      res.setHeader("Content-Length", videoResponse.headers["content-length"]);

      videoResponse.data.pipe(res);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        // Generate a new media source
        const fileId = videoData.mediaId;
        const newResult = await googleDrive.getMediaLink(fileId);

        // Update the videoLinks object and the JSON file
        videoLinks[uniqueId].src = newResult.src;
        fs.writeFileSync(videoLinksPath, JSON.stringify(videoLinks, null, 2));

        // Stream the new media source
        const newVideoResponse = await axios.get(newResult.src, {
          responseType: "stream",
        });

        res.setHeader("Content-Type", newVideoResponse.headers["content-type"]);
        res.setHeader(
          "Content-Length",
          newVideoResponse.headers["content-length"]
        );

        newVideoResponse.data.pipe(res);
      } else {
        res.status(400).send(err.message);
      }
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.get("/proxy-thumbnail/:uniqueId", async (req, res) => {
  try {
    const { uniqueId } = req.params;

    const videoData = videoLinks[uniqueId];
    if (!videoData) {
      return res.status(404).send("Thumbnail not found");
    }

    try {
      const thumbnailResponse = await axios.get(videoData.thumbnail, {
        responseType: "stream",
      });

      res.setHeader("Content-Type", thumbnailResponse.headers["content-type"]);
      res.setHeader(
        "Content-Length",
        thumbnailResponse.headers["content-length"]
      );

      thumbnailResponse.data.pipe(res);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        // Generate a new media source
        const fileId = videoData.mediaId;
        const newResult = await googleDrive.getMediaLink(fileId);

        // Update the videoLinks object and the JSON file
        videoLinks[uniqueId].thumbnail = newResult.thumbnail;
        fs.writeFileSync(videoLinksPath, JSON.stringify(videoLinks, null, 2));

        // Stream the new thumbnail
        const newThumbnailResponse = await axios.get(newResult.thumbnail, {
          responseType: "stream",
        });

        res.setHeader(
          "Content-Type",
          newThumbnailResponse.headers["content-type"]
        );
        res.setHeader(
          "Content-Length",
          newThumbnailResponse.headers["content-length"]
        );

        newThumbnailResponse.data.pipe(res);
      } else {
        res.status(400).send(err.message);
      }
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.get("/", async (req, res) => {
  const { url } = req.query;
  let fileId;

  if (!url || url.trim() === "") {
    return res.status(400).send("Please provide a valid URL");
  }

  // Checks if the URL is just the file ID
  if (/^[a-zA-Z0-9_-]+$/.test(url)) {
    fileId = url;
  } else {
    const match = /\/file\/d\/([a-zA-Z0-9_-]+)\//.exec(url);

    if (!match || !match[1]) {
      return res.status(400).send("Invalid URL format");
    }

    fileId = match[1];
  }

  const result = await googleDrive.getMediaLink(fileId);

  // Check if there's an existing unique ID for the media ID
  let uniqueId;
  const existingUniqueId = Object.entries(videoLinks).find(
    ([key, value]) => value.mediaId === fileId
  );

  if (existingUniqueId) {
    uniqueId = existingUniqueId[0];
  } else {
    // Generate a new unique ID
    uniqueId = crypto.randomBytes(5).toString("hex");

    // Save the video source, thumbnail, and media ID to the videoLinks object using the unique ID
    videoLinks[uniqueId] = {
      src: result.src,
      thumbnail: result.thumbnail,
      mediaId: fileId,
    };

    // Write the updated videoLinks object back to the JSON file
    fs.writeFileSync(videoLinksPath, JSON.stringify(videoLinks, null, 2));
  }

  // Send the result along with the unique ID
  res.send({
    ...result,
    uniqueId,
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
