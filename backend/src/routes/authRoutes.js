const express = require("express");
const { login, saveComplements } = require("../controllers/authController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.put("/me/complements", authenticateToken, saveComplements);

module.exports = {
  authRouter,
};
