const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const FileData = require("../models/fileSchema");
const { v4: uuid4 } = require("uuid");

router.get("/home", (req, res) => {
  res.render("home");
});

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

let upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 * 100 },
}).single("myFile");

router.post("/download", (req, res) => {
  //Store file
  upload(req, res, async (error) => {
    //Validate request
    if (!req.file) {
      return res.json({ error: "All fileds are required" });
    }
    if (error) {
      return res.status(500).send({ error: error.message });
    }
    //Store into database
    const file = new FileData({
      filename: req.file.filename,
      uuid: uuid4(),
      path: req.file.path,
      size: req.file.size,
    });
    const response = await file.save();
    res.render("download", {
      downloadLink: `${process.env.APP_BASE_URL}/files/download/${response.uuid}`,
      fileName: response.filename,
      fileSize: response.size,
    });
  });
});

router.get("/download/:uuid", async (req, res) => {
  try {
    const file = await FileData.findOne({ uuid: req.params.uuid });
    if (!file) {
      res.render("userdownload", { error: "Link not found!" });
    }
    res.render("userdownload", {
      downloadLink: `${process.env.APP_BASE_URL}/files/shared/download/${file.uuid}`,
      fileName: file.filename,
      fileSize: file.size,
    });
  } catch (error) {
    res.render("userdownload", { error: "Something went wrong!" });
  }
});

router.get("/shared/download/:uuid", async (req, res) => {
  const file = await FileData.findOne({ uuid: req.params.uuid });
  if (!file) {
    res.render("userdownload", { error: "Link is not working" });
  }

  const filePath = `${__dirname}/../${file.path}`;
  res.download(filePath);
});

module.exports = router;
