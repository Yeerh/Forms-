require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const { authRouter } = require("./routes/authRoutes");
const { formularioRouter } = require("./routes/formularioRoutes");
const { ensureStorage } = require("./utils/storage");

const app = express();
const port = process.env.PORT || 3001;

ensureStorage();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve(__dirname, "..", "uploads")));

app.get("/health", (request, response) => {
  response.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use("/", authRouter);
app.use("/", formularioRouter);

app.use((error, request, response, next) => {
  if (error.message === "INVALID_FILE_TYPE") {
    return response.status(400).json({
      message: "Tipo de arquivo invalido. Envie apenas arquivos PDF ou PNG.",
    });
  }

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return response.status(400).json({
        message: "Arquivo excede o tamanho maximo de 10MB.",
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return response.status(400).json({
        message: "Envie no maximo 10 arquivos por formulario.",
      });
    }
  }

  return response.status(500).json({
    message: "Erro interno do servidor.",
  });
});

app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});
