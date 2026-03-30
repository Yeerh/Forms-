const express = require("express");
const multer = require("multer");
const path = require("path");
const { createFormulario, getFormularios } = require("../controllers/formularioController");
const { uploadDirectory } = require("../utils/storage");

const allowedMimeTypes = ["application/pdf", "image/png"];

const storage = multer.diskStorage({
  destination: (request, file, callback) => {
    callback(null, uploadDirectory);
  },
  filename: (request, file, callback) => {
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    const safeName = baseName
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const fileName = `${Date.now()}-${safeName || "documento"}${extension}`;
    callback(null, fileName);
  },
});

const upload = multer({
  storage,
  limits: {
    files: 10,
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (request, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      callback(new Error("INVALID_FILE_TYPE"));
      return;
    }

    callback(null, true);
  },
});

const formularioRouter = express.Router();

formularioRouter.post("/formulario", upload.array("documentosApoio", 10), createFormulario);
formularioRouter.get("/formularios", getFormularios);

module.exports = {
  formularioRouter,
};
