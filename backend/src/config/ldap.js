function getDomainFromBaseDN(baseDN) {
  return String(baseDN || "")
    .split(",")
    .map((part) => part.trim())
    .filter((part) => /^DC=/i.test(part))
    .map((part) => part.replace(/^DC=/i, ""))
    .join(".");
}

const baseDN = process.env.AD_BASE_DN || "DC=paulista,DC=local";
const domain = process.env.AD_DOMAIN || getDomainFromBaseDN(baseDN);
const bindUser = process.env.AD_BIND_USER || "";
const serviceUsername =
  bindUser && !bindUser.includes("@") && domain ? `${bindUser}@${domain}` : bindUser;

module.exports = {
  url: process.env.AD_URL || "ldap://192.168.11.252:389",
  baseDN,
  searchBase: process.env.AD_SEARCH_BASE || baseDN,
  domain,
  serviceUsername,
  servicePassword: process.env.AD_BIND_PASSWORD || "",
  tlsOptions: {
    rejectUnauthorized: process.env.LDAP_REJECT_UNAUTHORIZED !== "false",
  },
};
