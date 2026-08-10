require("dotenv").config();
const crypto = require("crypto");
const { GM_TOKEN } = require("../config/securityConfig");

const FLAGS = {
  IDOR:   process.env.FLAG_IDOR   || "flag{idor_missing_env}",
  SSRF:   process.env.FLAG_SSRF   || "flag{ssrf_missing_env}",
  SQLI:   process.env.FLAG_SQLI   || "flag{sqli_missing_env}",
  LFI:    process.env.FLAG_LFI    || "flag{lfi_missing_env}",
  JWT:    process.env.FLAG_JWT    || "flag{jwt_missing_env}",
  CMDINJ: process.env.FLAG_CMDINJ || "flag{cmdinj_missing_env}",
};

class FlagService {
  getFlag(key) {
    return FLAGS[key] || "";
  }

  sha256(value) {
    return crypto.createHash("sha256").update(value || "").digest("hex");
  }

  verifyFlagHash(authHeader, vulnId, submittedHash) {
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token || token !== GM_TOKEN) {
      return { status: 401, data: { error: "Unauthorized request" } };
    }

    if (!vulnId || !submittedHash) {
      return { status: 400, data: { error: "Missing parameters" } };
    }

    const currentFlag = this.getFlag(vulnId);
    if (!currentFlag) {
      return { status: 200, data: { match: false } };
    }

    const expected = this.sha256(currentFlag);
    return { status: 200, data: { match: expected === submittedHash } };
  }
}

module.exports = new FlagService();
