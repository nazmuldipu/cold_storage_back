const express = require("express");
const app = express();
const port = process.env.PORT || 2096;

app.get("/", (req, res) => {
  res.send({ message: "Weclome to Node REST API" });
});

const server = app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

module.exports = server;
