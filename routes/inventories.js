const express = require("express");
const router = express.Router();
const { Inventory, validate } = require("../models/inventory");
const validateObjectId = require("../middleware/validateObjectId");
const validator = require("../middleware/validate");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// Create a Inventory for request with id, method = POST
router.post("/", [auth, validator(validate)], async (req, res) => {
  //Create Inventory object
  let inventory = new Inventory({
    date: req.body.date,
    inventoryType: req.body.inventoryType,
    vouchar_no: req.body.vouchar_no,
    sr_no: req.body.sr_no,
    name: req.body.name.trim(),
    customer: req.body.customer,
    agent: req.body.agent,
    year: req.body.year,
    quantity: req.body.quantity,    
  });
  
  let old_inventory = await Inventory.findOne({
    vouchar_no: req.body.vouchar_no,
  });

  if (old_inventory) {
    return res
      .status(400)
      .send(`Inventory with this vouchar_no \'${req.body.vouchar_no}\' already exist`);
  }
  inventory = await inventory.save(inventory);
  res.send(inventory);
});

module.exports = router;
