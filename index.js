const express = require("express");
const app = express();
const port = process.env.PORT || 2096;
const winston = require("winston");
const fs = require('fs');
const https = require('https');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

require("./startup/logging")();
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/prod")(app);
// require("./startup/validation")();
// require("./startup/prod")(app);


app.get("/", (req, res) => {
  res.send({ message: "Weclome to Node REST API" });
});

// const server = app.listen(port, () => {
//   winston.info(`Listening on port ${port}...`);
// });

var server = https.createServer(options, app);
server.listen(port, () => {
  winston.info(`Listening on port ${port}...`);
});


module.exports = server;





module.exports = server;
