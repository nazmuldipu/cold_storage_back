const express = require("express");
const router = express.Router();
const { Inventory, validate } = require("../models/inventory");
const { Customer } = require("../models/customer");
const { Agent } = require("../models/agent");
const validateObjectId = require("../middleware/validateObjectId");
const validator = require("../middleware/validate");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { required } = require("joi");

// Create a Inventory for request with id, method = POST
router.post("/", [auth, validator(validate)], async (req, res) => {
  let agent = req.body.agent;
  let customer = req.body.customer;

  if (!agent || !agent.phone) {
    //If not agent provided then save customer info as customer
    const dbCustomer = await Customer.findOne({
      $or: [
        { phone: customer.phone },
        {
          $and: [{ name: customer.name }, { father: customer.father }],
        },
      ],
    });
    if (!dbCustomer) {
      //Save customer
      customer = new Customer({
        name: customer.name,
        father: customer.father,
        phone: customer.phone,
        address: customer.address,
      });
      customer = await customer.save(customer);
    } else {
      customer = { ...dbCustomer };
    }
  } else {
    const dbAgent = await Agent.findOne({ phone: agent.phone });
    if (!dbAgent)
      return res
        .status(404)
        .send("The Agent with the given phone could not found");
  }

  //Create Inventory object
  let inventory = new Inventory({
    date: req.body.date,
    inventoryType: req.body.inventoryType,
    vouchar_no: req.body.vouchar_no,
    sr_no: req.body.sr_no,
    name: req.body.name.trim(),
    customer: customer,
    agent: agent,
    year: req.body.year,
    quantity: req.body.quantity,
  });

  let old_inventory = await Inventory.findOne({
    vouchar_no: req.body.vouchar_no,
  });

  if (old_inventory) {
    return res
      .status(400)
      .send(
        `Inventory with this vouchar_no \'${req.body.vouchar_no}\' already exist`
      );
  }
  inventory = await inventory.save(inventory);
  res.send(inventory);
});

/*READ all Inventory for request with method = GET*/
router.get("/", async (req, res) => {
  let perPage = 8;
  let page = Math.max(0, req.params.page);

  const inventories = await Inventory.find()
    .select("date vouchar_no sr_no customer agent year quantity")
    .limit(perPage)
    .skip(perPage * page)
    .sort({ vouchar_no: "asc" });

  res.send(inventories);
});

/*READ a Inventory for request with id, method = GET*/
router.get("/:id", validateObjectId, async (req, res) => {
  const inventory = await Inventory.findById(req.params.id);
  if (!inventory)
    return res
      .status(404)
      .send("The inventory with the given ID was not found");
  res.send(inventory);
});

/*Update a Inventory for request with id, method = PUT*/
router.put(
  "/:id",
  [auth, admin, validateObjectId, validator(validate)],
  async (req, res) => {
    let inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res
        .status(404)
        .send("The Inventory with the given ID was not found");
    }

    let agent = req.body.agent;
    let customer = req.body.customer;

    if (!agent || !agent.phone) {
      //If not agent provided then save customer info as customer
      const dbCustomer = await Customer.findOne({
        $or: [
          { phone: customer.phone },
          {
            $and: [{ name: customer.name }, { father: customer.father }],
          },
        ],
      });
      if (!dbCustomer) {
        //Save customer
        customer = new Customer({
          name: customer.name,
          father: customer.father,
          phone: customer.phone,
          address: customer.address,
        });
        customer = await customer.save(customer);
      } else {
        customer = { ...dbCustomer };
      }
    } else {
      const dbAgent = await Agent.findOne({ phone: agent.phone });
      if (!dbAgent)
        return res
          .status(404)
          .send("The Agent with the given phone could not found");
    }

    inventory = await Inventory.updateOne(
      { _id: inventory._id },
      {
        $set: {
          date: req.body.date,
          inventoryType: req.body.inventoryType,
          sr_no: req.body.sr_no,
          name: req.body.name.trim(),
          customer: customer,
          agent: agent,
          year: req.body.year,
          quantity: req.body.quantity,
        },
      }
    );
    res.send(inventory);
  }
);

/*DELETE a Inventory for request with id, method = DELETE*/
router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const inventory = await Inventory.findByIdAndRemove(req.params.id);

  if (!inventory)
    return res.status(404).send("The Inventory with the given ID was not found");

  res.send(inventory);
});


module.exports = router;
