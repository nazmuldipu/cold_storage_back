const mongoose = require("mongoose");
const Joi = require("joi");

const chamberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  slug: {
    type: String,
    required: false,
  },
  capacity: {
    type: Number,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
  version: {
    type: Number,
    required: true,
    default: 1,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const Chamber = mongoose.model("Chamber", chamberSchema);

function validateChamber(chamber) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    capacity: Joi.number().min(0).required(),
  });
  return schema.validate(chamber);
}

exports.Chamber = Chamber;
exports.validate = validateChamber;