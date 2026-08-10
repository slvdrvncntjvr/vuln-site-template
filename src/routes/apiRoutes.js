const express = require("express");
const router = express.Router();

const UserController = require("../controllers/UserController");
const CatalogController = require("../controllers/CatalogController");
const DocumentController = require("../controllers/DocumentController");
const ProxyController = require("../controllers/ProxyController");
const AdminController = require("../controllers/AdminController");
const DiagnosticController = require("../controllers/DiagnosticController");
const MetadataService = require("../services/MetadataService");
const flagService = require("../services/flagService");

// GM Anti-Cheat endpoint — used only by the CTF Platform Grader
router.post("/__gm/verify", (req, res) => {
  const { vulnId, hash } = req.body;
  const result = flagService.verifyFlagHash(req.headers.authorization, vulnId, hash);
  res.status(result.status).json(result.data);
});

// Internal metadata endpoint — simulates a cloud metadata service.
// Reachable via SSRF only (the app fetches it from itself on loopback).
router.get("/__internal/metadata", (req, res) => {
  res.json(MetadataService.getInstanceMetadata());
});

// REST API Endpoints
router.get("/api/users/:id/profile", UserController.getProfile);
router.get("/api/products/search", CatalogController.searchProducts);
router.get("/api/files", DocumentController.getFile);
router.get("/api/fetch", ProxyController.fetchContent);
router.get("/api/admin/secret", AdminController.getSecret);
router.get("/api/ping", DiagnosticController.runPing);

router.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "bob" && password === "shopper123") {
    return res.json({ userId: 2, token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIn0.fakehmac" });
  }
  return res.status(401).json({ error: "Invalid credentials" });
});

module.exports = router;
