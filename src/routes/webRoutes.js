const express = require("express");
const router = express.Router();

const catalogRepository = require("../repositories/CatalogRepository");
const userRepository = require("../repositories/UserRepository");
const pathSanitizer = require("../utils/PathSanitizer");
const shellExecutor = require("../utils/ShellExecutor");
const Views = require("../views/templates");

// Storefront Catalog Page
router.get("/", (req, res) => {
  const query = (req.query.q || "").toString();
  const products = catalogRepository.queryCatalog(query);
  res.send(Views.catalogPage(query, products));
});

// Profile Studio Page
router.get("/profile", (req, res) => {
  const requestingId = (req.query.user_id || "1").toString();
  const targetId = (req.query.target_id || requestingId).toString();

  let profileData = null;
  let errorMsg = "";

  // Bug: only checks that requestingId is present, not that it matches targetId
  if (requestingId) {
    profileData = userRepository.getFullProfile(targetId);
    if (!profileData) errorMsg = "User not found.";
  } else {
    errorMsg = "Access Denied: You do not have permission to view this profile.";
  }

  res.send(Views.profilePage(requestingId, targetId, profileData, errorMsg));
});


// Documentation Portal Page
router.get("/docs", (req, res) => {
  const filePath = (req.query.path || "readme.txt").toString();
  const result = pathSanitizer.resolveDocumentPath(filePath);
  const content = result.success ? result.content : result.error;
  res.send(Views.docsPage(filePath, content));
});

// Link Proxy Page
router.get("/fetch-preview", async (req, res) => {
  const targetUrl = (req.query.url || "").toString();
  let fetchedText = "";

  if (targetUrl) {
    try {
      const response = await fetch(targetUrl);
      fetchedText = await response.text();
    } catch (err) {
      fetchedText = "Fetch failed: " + err.message;
    }
  }

  res.send(Views.fetchPage(targetUrl, fetchedText));
});

// Ping Utility Page
router.get("/ping-utility", (req, res) => {
  const host = (req.query.host || "").toString();
  res.send(Views.pingPage(host));
});

// Admin Gateway Page
router.get("/admin-portal", (req, res) => {
  res.send(Views.adminPage());
});

module.exports = router;
