const express = require("express");
const userRoutes = require("../routes/users");
const chamberRoutes = require("../routes/chambers");
const inventoryRoutes = require("../routes/inventories");
const agentRoutes = require("../routes/agents");
const customerRoutes = require("../routes/customers");
const ledgerRoutes = require("../routes/ledgers");
const error = require("../middleware/error");
const authRoutes = require("../routes/auth");

const accesscontrol = require("../middleware/accesscontrol");

module.exports = function (app) {
  app.use(accesscontrol);
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/chamber", chamberRoutes);
  app.use("/api/inventory", inventoryRoutes);
  app.use("/api/ledger", ledgerRoutes);
  app.use("/api/customer", customerRoutes);
  app.use("/api/agent", agentRoutes);
  app.use(error);
};
