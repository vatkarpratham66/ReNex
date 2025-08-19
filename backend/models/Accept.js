const mongoose = require("mongoose");

const acceptSchema = new mongoose.Schema({
  donation_id: { type: mongoose.Schema.Types.ObjectId, required: true }, // Link to specific donation
  donor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Donor", required: true },
  ngo_id: { type: mongoose.Schema.Types.ObjectId, ref: "NGO", required: true },
  status: { 
    type: String, 
    enum: ["pending_pickup", "in_transit", "delivered"], 
    default: "pending_pickup" 
  }
}, { timestamps: true });

module.exports = mongoose.model("Accept", acceptSchema);
