const jwt = require("jsonwebtoken");
const { JWT_EXPIRES_IN, JWT_SECRET, users } = require("../config/auth");

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
  };
}

function login(request, response) {
  const { identifier, password } = request.body;

  if (!identifier || !password) {
    return response.status(400).json({
      message: "Informe usuario/e-mail e senha.",
    });
  }

  const normalizedIdentifier = String(identifier).trim().toLowerCase();
  const user = users.find((item) => {
    return (
      item.email.toLowerCase() === normalizedIdentifier ||
      item.username.toLowerCase() === normalizedIdentifier
    );
  });

  if (!user || user.password !== password) {
    return response.status(401).json({
      message: "Credenciais invalidas.",
    });
  }

  const token = jwt.sign(
    {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return response.status(200).json({
    token,
    user: sanitizeUser(user),
  });
}

module.exports = {
  login,
};

