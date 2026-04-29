const express = require("express");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/role");
const Donor = require("../models/Donor");
const Accept = require("../models/Accept");
const User = require("../models/User");
const upload = require("../middleware/uploadMiddleware");
const {
  sendDonationCreatedToDonor,
  sendDonationCreatedToMatchingNgos,
} = require("../services/notificationService");
const {
  deleteStoredAsset,
  storeUploadedFiles,
} = require("../services/storageService");

const router = express.Router();

const toBoolean = (value) => value === true || value === "true";
/**
 * GET /api/donations
 * Everyone (donor/ngo) sees available donations.
 */
router.get("/", auth, async (req, res) => {
  try {
    const { excludeMine, category } = req.query;
    // ✅ populate donor's user with phone too
    const donors = await Donor.find().populate("user_id", "name email phone");

    let items = [];
    for (const d of donors) {
      for (const sub of d.donations) {
        if (sub.status !== "available") continue;
        if (category && sub.category !== category) continue;
        if (excludeMine === "true" && req.user.role === "donor") {
          if (String(d.user_id?._id) === String(req.user.id)) continue;
        }
        items.push({
          ...sub.toObject(),
          donor: {
            donor_id: d._id,
            org_name: d.org_name || null,
            user_name: d.user_id?.name,
            user_email: d.user_id?.email,
            user_phone: d.user_id?.phone, // ✅ added phone
          },
        });
      }
    }

    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * POST /api/donations
 * Donor creates a donation (supports photos).
 */
router.post(
  "/",
  auth,
  requireRole("donor"),
  upload.array("photos", 5),
  async (req, res) => {
    let uploadedPhotoPaths = [];
    try {
      let donor = await Donor.findOne({ user_id: req.user.id });
      if (!donor) donor = new Donor({ user_id: req.user.id, org_name: "" });

      uploadedPhotoPaths = await storeUploadedFiles(req.files, {
        folder: "needo/donations",
      });

      donor.donations.push({
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        quantity: req.body.quantity,
        pickup_location: req.body.pickup_location,
        pickup_by: req.body.pickup_by,
        urgent: toBoolean(req.body.urgent),
        photos:
          uploadedPhotoPaths.length > 0 ? uploadedPhotoPaths : req.body.photos || [],
        status: "available",
      });

      await donor.save();
      const created = donor.donations[donor.donations.length - 1];

      const donorUser = await User.findById(req.user.id).select("name email");
      if (donorUser) {
        await sendDonationCreatedToDonor({ donorUser, donation: created });
        await sendDonationCreatedToMatchingNgos({ donorUser, donation: created });
      }

      res.status(201).json({ msg: "Donation created", donation: created });
    } catch (e) {
      if (uploadedPhotoPaths.length > 0) {
        await Promise.all(uploadedPhotoPaths.map((photo) => deleteStoredAsset(photo)));
      }
      console.error(e);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

/**
 * GET /api/donations/my
 * Logged-in donor's donations.
 */
router.get("/my", auth, requireRole("donor"), async (req, res) => {
  try {
    const donor = await Donor.findOne({ user_id: req.user.id });
    res.json(donor?.donations || []);
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * GET /api/donations/my/details
 * Donor sees which NGO accepted donations (with NGO contact info).
 */
router.get("/my/details", auth, requireRole("donor"), async (req, res) => {
  try {
    const donor = await Donor.findOne({ user_id: req.user.id });
    if (!donor) return res.json({ donations: [], accepts: [] });

    const accepts = await Accept.find({ donor_id: donor._id })
      .populate({
        path: "ngo_id",
        select: "ngo_name registration_no user_id",
        populate: {
          path: "user_id",
          select: "name email phone", // ✅ include contact info
        },
      })
      .lean();

    // reshape ngo info
    const enrichedAccepts = accepts.map((a) => ({
      ...a,
      ngo_id: {
        _id: a.ngo_id?._id,
        ngo_name: a.ngo_id?.ngo_name,
        registration_no: a.ngo_id?.registration_no,
        user_name: a.ngo_id?.user_id?.name,
        user_email: a.ngo_id?.user_id?.email,
        user_phone: a.ngo_id?.user_id?.phone, // ✅ WhatsApp contact
      },
    }));

    res.json({ donations: donor.donations, accepts: enrichedAccepts });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * PUT /api/donations/:donationId
 * Donor edits donation (supports updating photos).
 */
router.put(
  "/:donationId",
  auth,
  requireRole("donor"),
  upload.array("photos", 5),
  async (req, res) => {
    let newPhotos = [];
    try {
      const donor = await Donor.findOne({ user_id: req.user.id });
      if (!donor) return res.status(404).json({ msg: "Donor not found" });

      const donation = donor.donations.id(req.params.donationId);
      if (!donation) return res.status(404).json({ msg: "Donation not found" });
      if (donation.status === "completed") {
        return res.status(400).json({ msg: "Cannot edit a completed donation" });
      }

      // Photos update logic
      let updatedPhotos = donation.photos;
      if (req.files && req.files.length > 0) {
        newPhotos = await storeUploadedFiles(req.files, {
          folder: "needo/donations",
        });
        updatedPhotos = [...updatedPhotos, ...newPhotos];
      }
      if (req.body.photos) {
        updatedPhotos = Array.isArray(req.body.photos)
          ? req.body.photos
          : [req.body.photos];
      }

      // Update other fields
      donation.title = req.body.title || donation.title;
      donation.description = req.body.description || donation.description;
      donation.category = req.body.category || donation.category;
      donation.quantity = req.body.quantity || donation.quantity;
      donation.pickup_location = req.body.pickup_location || donation.pickup_location;
      donation.pickup_by = req.body.pickup_by || donation.pickup_by;
      donation.urgent =
        req.body.urgent !== undefined ? toBoolean(req.body.urgent) : donation.urgent;
      donation.photos = updatedPhotos;

      await donor.save();
      res.json({ msg: "Donation updated", donation });
    } catch (e) {
      if (newPhotos.length > 0) {
        await Promise.all(newPhotos.map((photo) => deleteStoredAsset(photo)));
      }
      console.error(e);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

/**
 * DELETE /api/donations/:donationId
 * Deletes donation + photos from uploads folder.
 */
router.delete("/:donationId", auth, requireRole("donor"), async (req, res) => {
  try {
    const donor = await Donor.findOne({ user_id: req.user.id });
    if (!donor) return res.status(404).json({ msg: "Donor not found" });

    const donation = donor.donations.id(req.params.donationId);
    if (!donation) return res.status(404).json({ msg: "Donation not found" });
    if (donation.status !== "available") {
      return res
        .status(400)
        .json({ msg: "Only available donations can be deleted" });
    }

    if (donation.photos && donation.photos.length > 0) {
      await Promise.all(
        donation.photos.map((photoPath) => deleteStoredAsset(photoPath))
      );
    }

    donation.remove();
    await donor.save();
    res.json({ msg: "Donation and associated photos deleted" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
