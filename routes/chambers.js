const express = require("express");
const router = express.Router();
const { Chamber, validate } = require("../models/chamber");
const validateObjectId = require("../middleware/validateObjectId");
const validator = require("../middleware/validate");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// Create a Chmaber for request with id, method = POST
router.post("/", [auth, validator(validate)], async (req, res) => {
  //Create Chamber object
  let slug = req.body.name.trim().replace(/\s+/g, "-").toLowerCase();
  let chamber = new Chamber({
    name: req.body.name.trim(),
    capacity: req.body.capacity,
    slug,
  });
  let old_chamber = await Chamber.findOne({
    name: req.body.name.trim(),
  });
  if (old_chamber) {
    return res
      .status(400)
      .send(`Chamber with this name \'${req.body.name}\' already exist`);
  }
  chamber = await chamber.save(chamber);
  res.send(chamber);
});

/*READ all Chamber for request with method = GET*/
router.get("/", async (req, res) => {
  let perPage = 10;
  let page = Math.max(0, req.params.page);

  const chambers = await Chamber.find()
    .select("name slug capacity")
    .limit(perPage)
    .skip(perPage * page)
    .sort({ priority: "asc" });

  res.send(chambers);
});

/*READ a Chamber for request with id, method = GET*/
router.get("/:id", validateObjectId, async (req, res) => {
  const chamber = await Chamber.findById(req.params.id);
  if (!chamber)
    return res.status(404).send("The chamber with the given ID was not found");
  res.send(chamber);
});

/*Update a Chamber for request with id, method = PUT*/
router.put(
  "/:id",
  [auth, admin, validateObjectId, validator(validate)],
  async (req, res) => {
    let chamber = await Chamber.findById(req.params.id);
    if (!chamber) {
      return res
        .status(404)
        .send("The Chamber with the given ID was not found");
    }

    slug = req.body.name.trim().replace(/\s+/g, "-").toLowerCase();
    chamber = await Chamber.updateOne(
      { _id: chamber._id },
      {
        $set: {
          name: req.body.name,
          slug,
          capacity: req.body.capacity,
        },
      }
    );
    res.send(chamber);
  }
);

/*DELETE a Chamber for request with id, method = DELETE*/
router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const chamber = await Chamber.findByIdAndRemove(req.params.id);

  if (!chamber)
    return res.status(404).send("The chamber with the given ID was not found");

  res.send(chamber);
});

module.exports = router;
