const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: String,
  password_hash: { type: String, required: true },
  role: { type: String, enum: ["donor", "ngo"], required: true }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
