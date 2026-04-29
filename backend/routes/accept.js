const express = require("express");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/role");
const Accept = require("../models/Accept");
const Donor = require("../models/Donor");
const NGO = require("../models/NGO");
const User = require("../models/User");
const {
  sendDonationAccepted,
  sendDonationStatusUpdate,
} = require("../services/notificationService");

const router = express.Router();

const allowedTransitions = {
  pending_pickup: ["in_transit"],
  in_transit: ["delivered"],
  delivered: [],
};

/**
 * POST /api/accept/:donationId
 * NGO accepts a donation (set donation.status -> "claimed", create Accept record)
 */
router.post("/:donationId", auth, requireRole("ngo"), async (req, res) => {
  try {
    const ngo = await NGO.findOne({ user_id: req.user.id });
    if (!ngo)
      return res
        .status(404)
        .json({ msg: "NGO profile not found. Complete your profile first." });

    // 🛡️ NEW SECURITY: block unverified NGOs
    if (!ngo.verified) {
      return res.status(403).json({
        msg: "Your NGO is not verified yet. Please wait for admin approval before accepting donations.",
      });
    }

    // locate donor that owns this subdoc
    const donor = await Donor.findOne({ "donations._id": req.params.donationId });
    if (!donor) return res.status(404).json({ msg: "Donation not found" });

    const donation = donor.donations.id(req.params.donationId);
    if (donation.status !== "available") {
      return res
        .status(400)
        .json({ msg: `Cannot accept; current status is ${donation.status}` });
    }

    // prevent double-accept
    const already = await Accept.findOne({ donation_id: donation._id });
    if (already) return res.status(400).json({ msg: "Donation already accepted" });

    // mark claimed
    donation.status = "claimed";
    await donor.save();

    const accept = new Accept({
      donation_id: donation._id,
      donor_id: donor._id,
      ngo_id: ngo._id,
      status: "pending_pickup",
    });
    await accept.save();

    const [donorUser, ngoUser] = await Promise.all([
      User.findById(donor.user_id).select("name email phone"),
      User.findById(req.user.id).select("name email phone"),
    ]);

    if (donorUser && ngoUser) {
      await sendDonationAccepted({
        donorUser,
        donation,
        ngo,
        ngoUser,
      });
    }

    res.status(201).json({ msg: "Donation accepted", accept });
  } catch (e) {
    console.error("Accept donation error:", e);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * PUT /api/accept/:id/status
 * NGO updates its own pickup status
 */
router.put(
  "/:id/status",
  auth,
  requireRole("ngo"),
  [body("status").isIn(["pending_pickup", "in_transit", "delivered"])],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const accept = await Accept.findById(req.params.id);
      if (!accept) return res.status(404).json({ msg: "Record not found" });

      // security: only the NGO who accepted can update
      const myNgo = await NGO.findOne({ user_id: req.user.id });
      if (!myNgo || String(myNgo._id) !== String(accept.ngo_id)) {
        return res.status(403).json({ msg: "You cannot update this record" });
      }

      const nextStatus = req.body.status;
      if (nextStatus === accept.status) {
        return res.json({ msg: "Status unchanged", accept });
      }

      const validNext = allowedTransitions[accept.status] || [];
      if (!validNext.includes(nextStatus)) {
        return res.status(400).json({
          msg: `Invalid status transition from ${accept.status} to ${nextStatus}`,
        });
      }

      accept.status = nextStatus;
      await accept.save();

      // if delivered, also mark donation as completed on donor doc
      if (accept.status === "delivered") {
        const donor = await Donor.findById(accept.donor_id);
        if (donor) {
          const sub = donor.donations.id(accept.donation_id);
          if (sub) {
            sub.status = "completed";
            await donor.save();
          }
        }
      }

      const donor = await Donor.findById(accept.donor_id);

      if (donor) {
        const donorAccount = await User.findById(donor.user_id).select("name email");
        const donation = donor.donations.id(accept.donation_id);
        if (donation && donorAccount && myNgo) {
          await sendDonationStatusUpdate({
            donorUser: donorAccount,
            donation,
            ngo: myNgo,
            status: accept.status,
          });
        }
      }

      res.json({ msg: "Status updated", accept });
    } catch (e) {
      res.status(500).json({ msg: "Server error" });
    }
  }
);

/**
 * GET /api/accept/my
 * NGO views their accepted pickups (with donation + donor info)
 */
router.get("/my", auth, requireRole("ngo"), async (req, res) => {
  try {
    const myNgo = await NGO.findOne({ user_id: req.user.id });
    if (!myNgo)
      return res.status(404).json({ msg: "NGO profile not found" });

    const accepts = await Accept.find({ ngo_id: myNgo._id }).lean();

    // attach donation subdoc + donor + ngo details
    const enriched = [];
    for (const a of accepts) {
      const donor = await Donor.findById(a.donor_id)
        .populate("user_id", "name email phone")
        .lean();
      const ngo = await NGO.findById(a.ngo_id)
        .populate("user_id", "name email phone")
        .lean();

      let donation = null;
      if (donor) {
        const sub = donor.donations.find(
          (d) => String(d._id) === String(a.donation_id)
        );
        donation = sub || null;
      }

      enriched.push({
        ...a,
        donor: donor
          ? {
              donor_id: donor._id,
              org_name: donor.org_name,
              user_name: donor.user_id?.name,
              user_email: donor.user_id?.email,
              user_phone: donor.user_id?.phone,
            }
          : null,
        ngo: ngo
          ? {
              ngo_id: ngo._id,
              ngo_name: ngo.ngo_name,
              registration_no: ngo.registration_no,
              user_name: ngo.user_id?.name,
              user_email: ngo.user_id?.email,
              user_phone: ngo.user_id?.phone,
            }
          : null,
        donation,
      });
    }

    // newest first by createdAt
    enriched.sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt));
    res.json(enriched);
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
