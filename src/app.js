const express = require("express");
const { PORT, APP_NAME } = require("./config/appConfig");
const apiRoutes = require("./routes/apiRoutes");
const webRoutes = require("./routes/webRoutes");

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
