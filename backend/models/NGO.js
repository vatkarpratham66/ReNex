const mongoose = require("mongoose");

const ngoSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ngo_name: { type: String, required: true },
    registration_no: { type: String, required: true },
    needs_category: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("NGO", ngoSchema);
