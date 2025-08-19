const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  org_name: String,

  donations: [
    {
      title: { type: String, required: true },
      description: String,
      category: { type: String, enum: ["Food", "Clothes", "Books", "Medical", "Other"], required: true },
      quantity: { type: Number, required: true },
      pickup_location: { type: String, required: true },
      pickup_by: Date,
      photos: [String],
      urgent: { type: Boolean, default: false },
      status: { type: String, enum: ["available", "claimed", "completed"], default: "available" },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Donor", donorSchema);
