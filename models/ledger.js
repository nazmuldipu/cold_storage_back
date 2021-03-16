const mongoose = require("mongoose");
const Joi = require("joi");
const mongoosePaginate = require("mongoose-paginate-v2");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 50 },
  slug: { type: String, required: false },
  father: { type: String, required: true },
  phone: { type: String, required: false },
  address: { type: String },
});

const ledgerSchema = new mongoose.Schema({
  sr_no: { type: String, required: true },
  year: { type: Number, required: true },
  customer: { type: userSchema },
  agent: { type: userSchema },

  loan_amount: { type: Number, required: true, default: 0 },
  loan_rate: { type: Number, required: true },
  loan_profit: { type: Number, required: true },
  loan_payable: { type: Number, required: true },

  quantity: { type: Number, required: true },
  rate: { type: Number, required: true },
  service_amount: { type: Number, required: true },

  emptyBag_quantity: { type: Number },
  emptyBag_rate: { type: Number },
  emptyBag_amount: { type: Number },

  total_amount: { type: Number },

  version: { type: Number, required: true, default: 1 },
  createdAt: { type: Date, required: true, default: Date.now },
});

ledgerSchema.plugin(mongoosePaginate);
const Ledger = mongoose.model("Ledger", ledgerSchema);

function validateLedger(ledger) {
  const userSchema = {
    name: Joi.string().min(3).max(50).required(),
    phone: Joi.string()
      .length(11)
      .regex(/^01[3-9][ ]?[0-9]{2}[ ]?[0-9]{3}[ ]?[0-9]{3}$/)
      .allow(null)
      .allow(""),
    father: Joi.string().min(3).max(50).required(),
    address: Joi.string(),
  };

  const schema = Joi.object({
    sr_no: Joi.string().required(),
    year: Joi.number().min(0).required(),
    customer: Joi.object().keys(userSchema).required(),
    agent: Joi.object().keys(userSchema).allow(null).allow(""),

    loan_amount: Joi.number().min(0).required(),
    loan_rate: Joi.number().min(0).required(),
    loan_profit: Joi.number().min(0).required(),
    loan_payable: Joi.number().min(0).required(),

    quantity: Joi.number().min(0).required(),
    rate: Joi.number().min(0).required(),
    service_amount: Joi.number().min(0).required(),

    emptyBag_quantity: Joi.number().min(0),
    emptyBag_rate: Joi.number().min(0),
    emptyBag_amount: Joi.number().min(0),

    total_amount: Joi.number().min(0),
  });
  
  return schema.validate(ledger);
}

exports.Ledger = Ledger;
exports.validate = validateLedger;
