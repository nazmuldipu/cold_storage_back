const express = require("express");
const router = express.Router();
const { Inventory } = require("../models/inventory");
const { Customer } = require("../models/customer");
const { Ledger, validate } = require("../models/ledger");
const { Agent } = require("../models/agent");
const validateObjectId = require("../middleware/validateObjectId");
const validator = require("../middleware/validate");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const pagiCheck = require("../middleware/paginations");
const _ = require("lodash");

// Create a Ledger for request with id, method = POST
router.post("/", [auth, validator(validate)], async (req, res) => {
  let dbLedger = await Ledger.findOne({ sr_no: req.body.sr_no });
  if (dbLedger)
    return res
      .status(404)
      .send("The Ledger with the given sr_no number already exists");

  let inventory = await Inventory.findOne({ sr_no: req.body.sr_no });
  if (!inventory)
    return res
      .status(404)
      .send("The Inventory with the given sr_no could not found");

  //Create Ledger object
  let ledger = new Ledger({
    sr_no: inventory.sr_no,
    year: inventory.year,
    customer: inventory.customer,

    loan_amount: req.body.loan_amount,
    loan_rate: req.body.loan_rate,
    loan_profit: req.body.loan_profit,
    loan_payable: req.body.loan_payable,

    quantity: req.body.quantity,
    rate: req.body.rate,
    service_amount: req.body.service_amount,

    emptyBag_quantity: req.body.emptyBag_quantity,
    emptyBag_rate: req.body.emptyBag_rate,
    emptyBag_amount: req.body.emptyBag_amount,
  });

  if (!_.isEmpty(inventory.agent)) {
    ledger.agent = inventory.agent;
  }

  //calculations
  ledger.loan_profit = (ledger.loan_amount * ledger.loan_rate) / 100;
  ledger.loan_payable = ledger.loan_profit + ledger.loan_amount;
  ledger.service_amount = ledger.quantity * ledger.rate;
  ledger.emptyBag_amount = ledger.emptyBag_quantity * ledger.emptyBag_rate;
  ledger.total_amount =
    ledger.loan_payable + ledger.emptyBag_amount + ledger.service_amount;

  ledger = await ledger.save(ledger);
  res.send(ledger);
});

/*READ all Ledger for request with method = GET*/
router.get("/", [auth, pagiCheck], async (req, res) => {
  const param = req.query.param;

  var query = param
    ? {
        $or: [
          { sr_no: { $regex: param } },
          { "customer.name": { $regex: param } },
          { "customer.phone": { $regex: param } },
          { "agent.phone": { $regex: param } },
        ],
      }
    : {};

  const options = {
    select:
      "sr_no customer agent year quantity rate service_amount loan_amount loan_rate loan_profit loan_payable emptyBag_quantity emptyBag_rate emptyBag_amount total_amount",
    sort: req.query.sort,
    page: req.query.page,
    limit: req.query.limit,
  };

  const ledgers = await Ledger.paginate(query, options);
  res.send(ledgers);
});

//TODO: write test
/*GET Ledger by date range ID*/
router.get("/daterange", [auth, pagiCheck], async (req, res) => {
  var query = {
    createdAt: { $gte: req.query.start, $lte: req.query.end },
  };

  const options = {
    select: "sr_no customer agent year quantity rate service_amount loan_amount loan_rate loan_profit loan_payable emptyBag_quantity emptyBag_rate emptyBag_amount total_amount",
    sort: req.query.sort,
    page: req.query.page,
    limit: 2000,
  };

  const ledgers = await Ledger.paginate(query, options);
  res.send(ledgers);
});


/*READ a Ledger for request with id, method = GET*/
router.get("/:id", validateObjectId, async (req, res) => {
  const ledger = await Ledger.findById(req.params.id);
  if (!ledger)
    return res.status(404).send("The ledger with the given ID was not found");
  res.send(ledger);
});

/*Update a Ledger for request with id, method = PUT*/
router.put(
  "/:id",
  [auth, admin, validateObjectId, validator(validate)],
  async (req, res) => {
    const dbLedger = await Ledger.findById(req.params.id);
    if (!dbLedger) {
      return res.status(404).send("The Ledger with the given ID was not found");
    }

    if (dbLedger.sr_no !== req.body.sr_no)
      return res.status(403).send("SR no mismatch");

    //calculations
    const loan_profit = (req.body.loan_amount * req.body.loan_rate) / 100;
    const loan_payable = loan_profit + req.body.loan_amount;
    const service_amount = req.body.quantity * req.body.rate;
    const emptyBag_amount = req.body.emptyBag_quantity * req.body.emptyBag_rate;
    const total_amount = loan_payable + emptyBag_amount + service_amount;
    let ledger = await Ledger.updateOne(
      { _id: dbLedger._id },
      {
        $set: {
          loan_amount: req.body.loan_amount,
          loan_rate: req.body.loan_rate,
          loan_profit,
          loan_payable,
          quantity: req.body.quantity,
          rate: req.body.rate,
          service_amount,
          emptyBag_quantity: req.body.emptyBag_quantity,
          emptyBag_rate: req.body.emptyBag_rate,
          emptyBag_amount,
          year: req.body.year,
          quantity: req.body.quantity,
          total_amount,
        },
      }
    );
    res.send(ledger);
  }
);

/*DELETE a Ledger for request with id, method = DELETE*/
router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const ledger = await Ledger.findByIdAndRemove(req.params.id);

  if (!ledger)
    return res
      .status(404)
      .send("The ledger with the given ID was not found");

  res.send(ledger);
});

module.exports = router;
