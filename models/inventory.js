const mongoose = require("mongoose");
const Joi = require("joi");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 50 },
  slug: { type: String, required: false },
  father: { type: String, required: true },
  phone: {
    type: String /*required by default**/,
    validate: {
      validator: function (v) {
        var re = /^01[3-9][ ]?[0-9]{2}[ ]?[0-9]{3}[ ]?[0-9]{3}$/;
        return v == null || v.trim().length < 1 || re.test(v);
      },
      message: "Provided phone number is invalid.",
    },
  },
  address: { type: String },
});

const inventorySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  inventoryType: {
    type: String,
    enum: ["RECEIVE", "DELIVERY"],
    default: "RECEIVE",
    required: true,
  },
  vouchar_no: { type: Number, required: true },
  sr_no: { type: String, required: true },
  name: { type: String, required: true },
  customer: { type: userSchema, required: true },
  agent: { type: userSchema },
  year: { type: Number, required: true },
  quantity: { type: Number, required: true },
  version: { type: Number, required: true, default: 1 },
  createdAt: { type: Date, required: true, default: Date.now },
});

const Inventory = mongoose.model("Inventory", inventorySchema);

function validateInventory(inventory) {
  const userSchema = {
    name: Joi.string().min(3).max(50).required(),
    phone: Joi.string()
      .length(11)
      .regex(/^01[3-9][ ]?[0-9]{2}[ ]?[0-9]{3}[ ]?[0-9]{3}$/),
    father: Joi.string().min(3).max(50).required(),
    address: Joi.string(),
  };

  const schema = Joi.object({
    date: Joi.date().required(),
    vouchar_no: Joi.number().min(0).required(),
    sr_no: Joi.string().required(),
    // inventoryType: Joi.string().required().valid("RECEIVE", "DELIVERY"),
    name: Joi.string().min(3).max(50).required(),
    customer: Joi.object().keys(userSchema).required(),
    agent: Joi.object().keys(userSchema).allow(null).allow(''),
    year: Joi.number().min(0).required(),
    quantity: Joi.number().min(0).required()
  });
  return schema.validate(inventory);
}

exports.Inventory = Inventory;
exports.validate = validateInventory;
