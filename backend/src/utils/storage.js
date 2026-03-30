const fs = require("fs");
const path = require("path");

const dataDirectory = path.resolve(__dirname, "..", "..", "data");
const uploadDirectory = path.resolve(__dirname, "..", "..", "uploads");
const dataFile = path.join(dataDirectory, "formularios.json");

function ensureStorage() {
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
  }

  if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, "[]", "utf8");
  }
}

function readFormularios() {
  ensureStorage();
  const fileContent = fs.readFileSync(dataFile, "utf8");

  try {
    const parsedContent = JSON.parse(fileContent);
    return Array.isArray(parsedContent) ? parsedContent : [];
  } catch (error) {
    return [];
  }
}

function writeFormularios(formularios) {
  ensureStorage();
  fs.writeFileSync(dataFile, JSON.stringify(formularios, null, 2), "utf8");
}

module.exports = {
  ensureStorage,
  readFormularios,
  writeFormularios,
  uploadDirectory,
};

