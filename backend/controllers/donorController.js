const Donor = require("../models/Donor");

// Add new donation
exports.addDonation = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user_id: req.user.id });
    if (!donor) return res.status(404).json({ msg: "Donor not found" });

    donor.donations.push(req.body);
    await donor.save();

    res.status(201).json({ msg: "Donation added", donation: donor.donations.slice(-1)[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get my donations
exports.getMyDonations = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user_id: req.user.id });
    if (!donor) return res.status(404).json({ msg: "Donor not found" });

    res.json(donor.donations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Update donation
exports.updateDonation = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user_id: req.user.id });
    if (!donor) return res.status(404).json({ msg: "Donor not found" });

    const donation = donor.donations.id(req.params.donationId);
    if (!donation) return res.status(404).json({ msg: "Donation not found" });

    Object.assign(donation, req.body);
    await donor.save();

    res.json({ msg: "Donation updated", donation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete donation
exports.deleteDonation = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user_id: req.user.id });
    if (!donor) return res.status(404).json({ msg: "Donor not found" });

    donor.donations.id(req.params.donationId).deleteOne();
    await donor.save();

    res.json({ msg: "Donation deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Donor summary (dashboard stats)
exports.getSummary = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user_id: req.user.id });
    if (!donor) return res.status(404).json({ msg: "Donor not found" });

    const total = donor.donations.length;
    const available = donor.donations.filter(d => d.status === "available").length;
    const claimed = donor.donations.filter(d => d.status === "claimed").length;
    const completed = donor.donations.filter(d => d.status === "completed").length;

    res.json({ total, available, claimed, completed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get donor profile
exports.getProfile = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user_id: req.user.id }).populate("user_id", "name email phone");
    if (!donor) return res.status(404).json({ msg: "Donor not found" });

    res.json({
      name: donor.user_id.name,
      email: donor.user_id.email,
      phone: donor.user_id.phone,
      org_name: donor.org_name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Update donor profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, org_name } = req.body;

    // Update donor fields
    let donor = await Donor.findOne({ user_id: req.user.id });
    if (!donor) return res.status(404).json({ msg: "Donor not found" });

    donor.org_name = org_name || donor.org_name;
    await donor.save();

    // Update User fields
    await Donor.model("User").findByIdAndUpdate(req.user.id, { name, phone });

    res.json({ msg: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
