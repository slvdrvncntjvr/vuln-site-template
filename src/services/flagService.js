require("dotenv").config();
const crypto = require("crypto");
const { GM_TOKEN } = require("../config/securityConfig");

// Opaque env-var names (FLAG1…FLAG6) — slot order matches the platform contract.
const FLAGS = {
  IDOR:   process.env.FLAG1 || "flag{flag1_missing_env}",
  SSRF:   process.env.FLAG2 || "flag{flag2_missing_env}",
  SQLI:   process.env.FLAG3 || "flag{flag3_missing_env}",
  LFI:    process.env.FLAG4 || "flag{flag4_missing_env}",
  JWT:    process.env.FLAG5 || "flag{flag5_missing_env}",
  CMDINJ: process.env.FLAG6 || "flag{flag6_missing_env}",
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
