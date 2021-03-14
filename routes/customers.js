const express = require("express");
const router = express.Router();
const { Customer, validate } = require("../models/customer");
const validateObjectId = require("../middleware/validateObjectId");
const validator = require("../middleware/validate");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// Create a Customer for request with id, method = POST
router.post("/", [auth, validator(validate)], async (req, res) => {
  //Create Customer object
  let slug = req.body.name.trim().replace(/\s+/g, "-").toLowerCase();
  let customer = new Customer({
    name: req.body.name.trim(),
    phone: req.body.phone,
    father: req.body.father,
    address: req.body.address,
    slug,
  });
  let old_customer = await Customer.findOne({
    name: req.body.name.trim(),
  });
  if (old_customer) {
    return res
      .status(400)
      .send(`Customer with this name \'${req.body.name}\' already exist`);
  }
  customer = await customer.save(customer);
  res.send(customer);
});

/*READ all Customer for request with method = GET*/
router.get("/", async (req, res) => {
  let perPage = 8;
  let page = Math.max(0, req.params.page);

  const customers = await Customer.find()
    .select("name phone father address")
    .limit(perPage)
    .skip(perPage * page)
    .sort({ name: "asc" });

  res.send(customers);
});

/*READ a Customer for request with id, method = GET*/
router.get("/:id", validateObjectId, async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer)
    return res.status(404).send("The customer with the given ID was not found");
  res.send(customer);
});

/*Update a Customer for request with id, method = PUT*/
router.put(
  "/:id",
  [auth, admin, validateObjectId, validator(validate)],
  async (req, res) => {
    let customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).send("The Customer with the given ID was not found");
    }

    slug = req.body.name.trim().replace(/\s+/g, "-").toLowerCase();
    customer = await Customer.updateOne(
      { _id: customer._id },
      {
        $set: {
          name: req.body.name,
          slug,
          phone: req.body.phone,
          father: req.body.father,
          address: req.body.address,
        },
      }
    );
    res.send(customer);
  }
);

/*DELETE a Customer for request with id, method = DELETE*/
router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const customer = await Customer.findByIdAndRemove(req.params.id);

  if (!customer)
    return res.status(404).send("The customer with the given ID was not found");

  res.send(customer);
});

module.exports = router;
