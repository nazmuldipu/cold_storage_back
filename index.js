const express = require("express");
const app = express();
const port = process.env.PORT || 2096;
const winston = require("winston");

require("./startup/logging")();
require("./startup/routes")(app);
require("./startup/db")();
// require("./startup/prod")(app);
require("./startup/validation")();

app.get("/", (req, res) => {
  res.send({ message: "Weclome to Node REST API" });
});

const server = app.listen(port, () => {
  winston.info(`Listening on port ${port}...`);
});

module.exports = server;
