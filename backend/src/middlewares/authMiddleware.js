const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/auth");

function extractToken(authorizationHeader = "") {
  if (!authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.slice("Bearer ".length).trim();
}

function authenticateToken(request, response, next) {
  const token = extractToken(request.headers.authorization);

  if (!token) {
    return response.status(401).json({
      message: "Token de autenticacao ausente.",
    });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    request.user = payload;
    return next();
  } catch (error) {
    return response.status(401).json({
      message: "Token invalido ou expirado.",
    });
  }
}

module.exports = {
  authenticateToken,
};

