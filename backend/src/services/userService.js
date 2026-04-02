const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");

async function upsertLdapUser(ldapUser, password) {
  const ldapUsername = String(ldapUser?.username || "")
    .trim()
    .toLowerCase();

  if (!ldapUsername) {
    throw new Error("Usuario LDAP invalido.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const existingUser = await prisma.user.findUnique({
    where: {
      ldapUsername,
    },
  });

  if (!existingUser) {
    return prisma.user.create({
      data: {
        ldapUsername,
        passwordHash,
        name: ldapUser?.name || null,
        email: ldapUser?.email || null,
        complemented: false,
        lastLoginAt: new Date(),
      },
    });
  }

  return prisma.user.update({
    where: {
      id: existingUser.id,
    },
    data: {
      passwordHash,
      name: existingUser.complemented ? existingUser.name : ldapUser?.name || existingUser.name,
      email: existingUser.complemented ? existingUser.email : ldapUser?.email || existingUser.email,
      lastLoginAt: new Date(),
    },
  });
}

async function updateComplements(userId, payload) {
  return prisma.user.update({
    where: {
      id: Number(userId),
    },
    data: {
      name: payload.name,
      email: payload.email,
      cpf: payload.cpf,
      phone: payload.phone,
      complemented: true,
    },
  });
}

async function findUserById(userId) {
  return prisma.user.findUnique({
    where: {
      id: Number(userId),
    },
  });
}

module.exports = {
  upsertLdapUser,
  updateComplements,
  findUserById,
};
