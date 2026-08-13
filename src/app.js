require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const { PORT, APP_NAME } = require("./config/appConfig");
const { sessionMiddleware } = require("./middleware/session");
const store = require("./store");
const apiRoutes = require("./routes/apiRoutes");
const webRoutes = require("./routes/webRoutes");

(function plantLfiFlag() {
  const lfiFlag = process.env.FLAG4;
  if (!lfiFlag) return;
  try {
    const secretPath = path.join(__dirname, "..", "secret.txt");
    fs.writeFileSync(secretPath, `${lfiFlag}\n`, "utf8");
  } catch (err) {
    console.error("startup:", err.message);
  }
})();

store.initStore();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use(webRoutes);
app.use(apiRoutes);

app.listen(PORT, () => {
  console.log(`${APP_NAME} listening on port ${PORT}`);
});

module.exports = app;
