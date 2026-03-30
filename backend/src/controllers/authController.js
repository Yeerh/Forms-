const jwt = require("jsonwebtoken");
const { JWT_EXPIRES_IN, JWT_SECRET } = require("../config/auth");
const ldapAuthService = require("../services/ldapAuthService");

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
  };
}

async function login(request, response) {
  const { identifier, password } = request.body;

  if (!identifier || !password) {
    return response.status(400).json({
      message: "Informe usuario/e-mail e senha.",
    });
  }

  try {
    const user = await ldapAuthService.authenticate(identifier, password);

    const token = jwt.sign(
      {
        sub: user.id || user.username || user.email,
        name: user.name,
        email: user.email,
        role: user.role,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return response.status(200).json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return response.status(401).json({
      message: error.message || "Credenciais invalidas.",
    });
  }
}

module.exports = {
  login,
};

