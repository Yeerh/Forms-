const jwt = require("jsonwebtoken");
const { JWT_EXPIRES_IN, JWT_SECRET } = require("../config/auth");
const ldapAuthService = require("../services/ldapAuthService");
const userService = require("../services/userService");

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.ldapUsername || user.username,
    role: user.role || "ldap",
    cpf: user.cpf || null,
    phone: user.phone || null,
    complemented: Boolean(user.complemented),
  };
}

function buildToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      userId: user.id,
      name: user.name,
      email: user.email,
      role: "ldap",
      username: user.ldapUsername || user.username,
      complemented: Boolean(user.complemented),
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

async function login(request, response) {
  const { identifier, password } = request.body;

  if (!identifier || !password) {
    return response.status(400).json({
      message: "Informe usuario/e-mail e senha.",
    });
  }

  try {
    const ldapUser = await ldapAuthService.authenticate(identifier, password);
    const user = await userService.upsertLdapUser(ldapUser, password);
    const token = buildToken(user);

    return response.status(200).json({
      token,
      user: sanitizeUser(user),
      requiresComplements: !user.complemented,
    });
  } catch (error) {
    return response.status(401).json({
      message: error.message || "Credenciais invalidas.",
    });
  }
}

async function saveComplements(request, response) {
  const { name, email, cpf, phone } = request.body;

  if (!name || !email || !cpf || !phone) {
    return response.status(400).json({
      message: "Informe nome, email, CPF e telefone.",
    });
  }

  try {
    const currentUser = await userService.findUserById(request.user.userId);

    if (!currentUser) {
      return response.status(404).json({
        message: "Usuario nao encontrado.",
      });
    }

    const user = await userService.updateComplements(currentUser.id, {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      cpf: String(cpf).trim(),
      phone: String(phone).trim(),
    });

    const token = buildToken(user);

    return response.status(200).json({
      token,
      user: sanitizeUser(user),
      requiresComplements: false,
    });
  } catch (error) {
    return response.status(500).json({
      message: "Nao foi possivel salvar os dados complementares.",
    });
  }
}

module.exports = {
  login,
  saveComplements,
};
