require("dotenv").config();
const CryptoUtil = require("../utils/CryptoUtil");
const flagService = require("../services/flagService");

// The admin dashboard data — only accessible with a valid signed JWT.
// Bug: the token verifier accepts alg:none, meaning a forged unsigned token grants admin access.
const ADMIN_DASHBOARD = {
  status: "operational",
  activeUsers: 1284,
  revenue_today: "$14,322.88",
  last_deploy: "2026-08-10T02:00:00Z",
  internal_ops_token: flagService.getFlag("JWT"),
};

class AdminController {
  static getSecret(req, res) {
    const authHeader = req.headers.authorization || "";
    const rawToken = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!rawToken) {
      return res.status(401).json({ error: "Authorization header required" });
    }

    const header = CryptoUtil.parseJwtHeader(rawToken);
    if (!header) {
      return res.status(401).json({ error: "Malformed token" });
    }

    if (header.alg === "none" || header.alg === "NONE") {
      return res.json(ADMIN_DASHBOARD);
    }

    return res.status(403).json({ error: "Invalid token signature" });
  }
}

module.exports = AdminController;
