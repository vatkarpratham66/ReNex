const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    category: {
      type: String,
      enum: [
        "Food",
        "Food Surplus",
        "Clothes",
        "Education",
        "Educational Items",
        "Medical",
        "Other",
      ],
      required: true,
    },
    quantity: { type: Number, required: true },
    pickup_location: { type: String, required: true },
    pickup_by: Date, // expected pickup time
    photos: [String], // photo URLs
    urgent: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["available", "claimed", "completed"],
      default: "available",
    },
  },
  { timestamps: true }
);

const donorSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    org_name: String,
    donations: [donationSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donor", donorSchema);
