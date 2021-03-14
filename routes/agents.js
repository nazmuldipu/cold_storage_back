const express = require("express");
const router = express.Router();
const { Agent, validate } = require("../models/agent");
const validateObjectId = require("../middleware/validateObjectId");
const validator = require("../middleware/validate");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// Create a Agent for request with id, method = POST
router.post("/", [auth, validator(validate)], async (req, res) => {
  //Create Agent object
  let slug = req.body.name.trim().replace(/\s+/g, "-").toLowerCase();
  let agent = new Agent({
    name: req.body.name.trim(),
    phone: req.body.phone,
    father: req.body.father,
    address: req.body.address,
    slug,
  });
  let old_agent = await Agent.findOne({
    name: req.body.name.trim(),
  });
  if (old_agent) {
    return res
      .status(400)
      .send(`Agent with this name \'${req.body.name}\' already exist`);
  }
  agent = await agent.save(agent);
  res.send(agent);
});

/*READ all Agent for request with method = GET*/
router.get("/", async (req, res) => {
  let perPage = 8;
  let page = Math.max(0, req.params.page);

  const agents = await Agent.find()
    .select("name phone father address")
    .limit(perPage)
    .skip(perPage * page)
    .sort({ name: "asc" });

  res.send(agents);
});

/*READ a Agent for request with id, method = GET*/
router.get("/:id", validateObjectId, async (req, res) => {
  const agent = await Agent.findById(req.params.id);
  if (!agent)
    return res.status(404).send("The agent with the given ID was not found");
  res.send(agent);
});

/*Update a Agent for request with id, method = PUT*/
router.put(
  "/:id",
  [auth, admin, validateObjectId, validator(validate)],
  async (req, res) => {
    let agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).send("The Agent with the given ID was not found");
    }

    slug = req.body.name.trim().replace(/\s+/g, "-").toLowerCase();
    agent = await Agent.updateOne(
      { _id: agent._id },
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
    res.send(agent);
  }
);

/*DELETE a Agent for request with id, method = DELETE*/
router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const agent = await Agent.findByIdAndRemove(req.params.id);

  if (!agent)
    return res.status(404).send("The agent with the given ID was not found");

  res.send(agent);
});

module.exports = router;
