const JWT_SECRET = process.env.JWT_SECRET || "forms-dev-secret-change-this";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

const users = [
  {
    id: "1",
    name: "Administrador",
    username: "admin",
    email: "admin@projetos.local",
    password: "123456",
    role: "secretaria",
  },
];

module.exports = {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  users,
};

