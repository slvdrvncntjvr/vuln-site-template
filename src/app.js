const express = require("express");
const fs = require("fs");
const path = require("path");
const { PORT, APP_NAME } = require("./config/appConfig");
const apiRoutes = require("./routes/apiRoutes");
const webRoutes = require("./routes/webRoutes");

// ---------------------------------------------------------------------------
// Plant the LFI flag into secret.txt from the environment at startup.
// Unlike the other five flags (served from process.env via flagService), the
// LFI vector reads a real file on disk. Sourcing that file's contents from
// FLAG_LFI keeps the flag unique per team and in sync with the CTF platform.
// ---------------------------------------------------------------------------
(function plantLfiFlag() {
  const lfiFlag = process.env.FLAG_LFI;
  if (!lfiFlag) return; // No env value provided — leave the committed file as-is.
  try {
    const secretPath = path.join(__dirname, "..", "secret.txt");
    fs.writeFileSync(secretPath, `${lfiFlag}\n`, "utf8");
  } catch (err) {
    console.error("Could not plant LFI flag into secret.txt:", err.message);
  }
})();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount Web & API Routers
app.use(webRoutes);
app.use(apiRoutes);

app.listen(PORT, () => {
  console.log(`${APP_NAME} listening on port ${PORT}`);
});

module.exports = app;
