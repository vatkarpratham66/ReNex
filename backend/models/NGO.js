const mongoose = require("mongoose");

const ngoSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ngo_name: String,
  registration_no: String
}, { timestamps: true });

module.exports = mongoose.model("NGO", ngoSchema);
