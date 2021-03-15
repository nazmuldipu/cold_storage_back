const mongoose = require("mongoose");
const Joi = require("joi");
const mongoosePaginate = require("mongoose-paginate-v2");

const agentSchema = new mongoose.Schema({
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
  father: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  phone: {
    type: String /*required by default**/,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        var re = /^01[3-9][ ]?[0-9]{2}[ ]?[0-9]{3}[ ]?[0-9]{3}$/;
        return v == null || v.trim().length < 1 || re.test(v);
      },
      message: "Provided phone number is invalid.",
    },
  },
  address: {
    type: String,
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

agentSchema.plugin(mongoosePaginate);
const Agent = mongoose.model("Agent", agentSchema);

function validateAgent(agent) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    phone: Joi.string()
      .length(11)
      .regex(/^01[3-9][ ]?[0-9]{2}[ ]?[0-9]{3}[ ]?[0-9]{3}$/)
      .required(),
    father: Joi.string().min(3).max(50).required(),
    address: Joi.string(),
  });
  return schema.validate(agent);
}

exports.Agent = Agent;
exports.validate = validateAgent;
