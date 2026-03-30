const ActiveDirectory = require("activedirectory2");
const ldapConfig = require("../config/ldap");

class LdapAuthService {
  constructor() {
    const config = {
      url: ldapConfig.url,
      baseDN: ldapConfig.baseDN,
      username: ldapConfig.serviceUsername,
      password: ldapConfig.servicePassword,
      tlsOptions: ldapConfig.tlsOptions,
    };

    if (!ldapConfig.servicePassword) {
      console.warn("[LDAP] AD_BIND_PASSWORD nao configurada no backend/.env");
    }

    this.ad = new ActiveDirectory(config);
  }

  async authenticate(identifier, password) {
    if (!identifier || !password) {
      throw new Error("Informe usuario/e-mail e senha.");
    }

    const normalizedIdentifier = String(identifier).trim();
    const userPrincipal = this._buildUserPrincipal(normalizedIdentifier);

    await this._authenticatePrincipal(userPrincipal, password);

    try {
      return await this._getUserData(userPrincipal, normalizedIdentifier);
    } catch (error) {
      return this._buildFallbackUser(normalizedIdentifier, userPrincipal);
    }
  }

  _buildUserPrincipal(identifier) {
    if (identifier.includes("@")) {
      return identifier;
    }

    if (!ldapConfig.domain) {
      return identifier;
    }

    return `${identifier}@${ldapConfig.domain}`;
  }

  _authenticatePrincipal(userPrincipal, password) {
    return new Promise((resolve, reject) => {
      this.ad.authenticate(userPrincipal, password, (error, authenticated) => {
        if (error) {
          return reject(new Error(this._parseLdapError(error)));
        }

        if (!authenticated) {
          return reject(new Error("Credenciais invalidas."));
        }

        return resolve();
      });
    });
  }

  _getUserData(userPrincipal, identifier) {
    return new Promise((resolve, reject) => {
      const escapedPrincipal = this._escapeLdap(userPrincipal);
      const escapedIdentifier = this._escapeLdap(identifier);
      const opts = {
        baseDN: ldapConfig.searchBase,
        filter: `(|(userPrincipalName=${escapedPrincipal})(mail=${escapedIdentifier})(sAMAccountName=${escapedIdentifier}))`,
        scope: "sub",
        attributes: [
          "cn",
          "displayName",
          "mail",
          "sAMAccountName",
          "userPrincipalName",
          "department",
          "title",
          "physicalDeliveryOfficeName",
          "telephoneNumber",
          "mobile",
          "givenName",
          "sn",
          "memberOf",
          "manager",
          "objectGUID",
          "distinguishedName",
        ],
      };

      this.ad.find(opts, (error, results) => {
        if (error) {
          return reject(error);
        }

        const users = Array.isArray(results?.users) ? results.users : [];
        if (!users.length) {
          return reject(new Error("Usuario nao encontrado no diretorio."));
        }

        const user = users[0];
        const rawGroups = user.memberOf || [];
        const groups = Array.isArray(rawGroups) ? rawGroups : [rawGroups];

        return resolve({
          id: user.objectGUID ? this._formatObjectGuid(user.objectGUID) : null,
          name: user.displayName || user.cn || user.sAMAccountName || identifier,
          email: user.mail || user.userPrincipalName || userPrincipal,
          username: user.sAMAccountName || identifier,
          role: "ldap",
          department: user.department || null,
          title: user.title || null,
          office: user.physicalDeliveryOfficeName || null,
          telephone: user.telephoneNumber || null,
          mobile: user.mobile || null,
          firstName: user.givenName || null,
          lastName: user.sn || null,
          manager: user.manager || null,
          distinguishedName: user.distinguishedName || null,
          userPrincipalName: user.userPrincipalName || userPrincipal,
          memberOf: groups,
          memberOfNames: groups.map((group) => this._extractCN(group)),
        });
      });
    });
  }

  _buildFallbackUser(identifier, userPrincipal) {
    return {
      id: null,
      name: identifier,
      email: userPrincipal,
      username: identifier.includes("@") ? identifier.split("@")[0] : identifier,
      role: "ldap",
      department: null,
      title: null,
      office: null,
      telephone: null,
      mobile: null,
      firstName: null,
      lastName: null,
      manager: null,
      distinguishedName: null,
      userPrincipalName: userPrincipal,
      memberOf: [],
      memberOfNames: [],
    };
  }

  _formatObjectGuid(guid) {
    if (!guid) {
      return null;
    }

    const buffer = Buffer.isBuffer(guid) ? guid : Buffer.from(guid);
    if (buffer.length < 16) {
      return null;
    }

    const hex = buffer.toString("hex");
    return [
      hex.slice(6, 8) + hex.slice(4, 6) + hex.slice(2, 4) + hex.slice(0, 2),
      hex.slice(10, 12) + hex.slice(8, 10),
      hex.slice(14, 16) + hex.slice(12, 14),
      hex.slice(16, 20),
      hex.slice(20, 32),
    ].join("-");
  }

  _extractCN(distinguishedName) {
    if (!distinguishedName || typeof distinguishedName !== "string") {
      return distinguishedName;
    }

    const match = distinguishedName.match(/^CN=([^,]+)/i);
    return match ? match[1] : distinguishedName;
  }

  _escapeLdap(value) {
    const escapeMap = {
      "\\": "\\5c",
      "*": "\\2a",
      "(": "\\28",
      ")": "\\29",
      "\0": "\\00",
    };

    return String(value).replace(/[\\*()\x00]/g, (char) => escapeMap[char] || char);
  }

  _parseLdapError(error) {
    const message = String(error?.message || error || "").toLowerCase();

    if (message.includes("invalid credentials") || message.includes("data 52e") || message.includes("49")) {
      return "Credenciais invalidas.";
    }

    if (message.includes("etimedout") || message.includes("econnrefused") || message.includes("connect")) {
      return "Nao foi possivel conectar ao servidor LDAP.";
    }

    if (message.includes("tls") || message.includes("certificate") || message.includes("ssl")) {
      return "Erro de certificado SSL/TLS na conexao com o LDAP.";
    }

    return error?.message || "Erro ao autenticar no LDAP.";
  }
}

module.exports = new LdapAuthService();
