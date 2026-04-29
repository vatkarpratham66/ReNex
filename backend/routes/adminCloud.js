const express = require("express");
const User = require("../models/User");
const NGO = require("../models/NGO");
const Donor = require("../models/Donor");
const Accept = require("../models/Accept");
const auth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/role");
const upload = require("../middleware/uploadMiddleware");
const {
  deleteStoredAsset,
  storeUploadedFile,
} = require("../services/storageService");
const {
  sendNgoVerificationResult,
  sendUserBlockedStatus,
} = require("../services/notificationService");

const router = express.Router();

router.use(auth, requireRole("admin"));

router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalNGOs = await NGO.countDocuments();
    const verifiedNGOs = await NGO.countDocuments({ verified: true });
    const donors = await Donor.find();

    let totalDonations = 0;
    let completedDonations = 0;
    let activeDonations = 0;

    donors.forEach((donor) => {
      totalDonations += donor.donations.length;
      completedDonations += donor.donations.filter(
        (item) => item.status === "completed"
      ).length;
      activeDonations += donor.donations.filter(
        (item) => item.status === "available"
      ).length;
    });

    res.json({
      totalUsers,
      totalNGOs,
      verifiedNGOs,
      totalDonations,
      activeDonations,
      completedDonations,
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password_hash");
    res.json(users);
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

router.put("/users/:id/block", async (req, res) => {
  try {
    const { blocked } = req.body;
    if (String(req.user._id) === String(req.params.id) && blocked) {
      return res.status(400).json({ msg: "You cannot block your own account" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { blocked: Boolean(blocked) },
      { new: true }
    ).select("-password_hash");

    if (!user) return res.status(404).json({ msg: "User not found" });

    await sendUserBlockedStatus({ user, blocked: Boolean(blocked) });
    res.json({ msg: `User ${blocked ? "blocked" : "unblocked"}`, user });
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    if (String(req.user._id) === String(req.params.id)) {
      return res.status(400).json({ msg: "You cannot delete your own account" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.role === "donor") {
      const donor = await Donor.findOne({ user_id: user._id });
      if (donor) {
        const donationAssets = donor.donations.flatMap((donation) => donation.photos || []);
        await Promise.all(donationAssets.map((photo) => deleteStoredAsset(photo)));
        await Accept.deleteMany({ donor_id: donor._id });
        await donor.deleteOne();
      }
    }

    if (user.role === "ngo") {
      const ngo = await NGO.findOne({ user_id: user._id });
      if (ngo) {
        const accepts = await Accept.find({ ngo_id: ngo._id });

        for (const accept of accepts) {
          if (accept.status !== "delivered") {
            const donor = await Donor.findById(accept.donor_id);
            const donation = donor?.donations.id(accept.donation_id);
            if (donation) {
              donation.status = "available";
              await donor.save();
            }
          }
        }

        if (ngo.certificateUrl) {
          await deleteStoredAsset(ngo.certificateUrl);
        }

        await Accept.deleteMany({ ngo_id: ngo._id });
        await ngo.deleteOne();
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "User and related records deleted" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/ngos", async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const ngos = await NGO.find(filter)
      .populate("user_id", "name email phone")
      .sort({ createdAt: -1 });

    res.json(ngos);
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

router.put("/ngos/:id/verify", upload.single("certificate"), async (req, res) => {
  let newCertificateUrl = "";
  let previousCertificateUrl = "";

  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) return res.status(404).json({ msg: "NGO not found" });

    if (req.file) {
      newCertificateUrl = await storeUploadedFile(req.file, {
        folder: "needo/ngo-certificates",
      });
      previousCertificateUrl = ngo.certificateUrl || "";
      ngo.certificateUrl = newCertificateUrl;
    }

    ngo.status = "verified";
    ngo.verified = true;
    ngo.verifiedBy = req.user.id;
    ngo.verifiedAt = new Date();

    await ngo.save();

    if (
      previousCertificateUrl &&
      newCertificateUrl &&
      previousCertificateUrl !== newCertificateUrl
    ) {
      await deleteStoredAsset(previousCertificateUrl);
    }

    const ngoUser = await User.findById(ngo.user_id).select("name email");
    if (ngoUser) {
      await sendNgoVerificationResult({ ngo, ngoUser, approved: true });
    }

    res.json({ msg: "NGO verified successfully", ngo });
  } catch (error) {
    if (newCertificateUrl) {
      await deleteStoredAsset(newCertificateUrl);
    }
    console.error("Verify NGO error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

router.delete("/ngos/:id/reject", async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) return res.status(404).json({ msg: "NGO not found" });

    ngo.status = "rejected";
    ngo.verified = false;

    await ngo.save();
    const ngoUser = await User.findById(ngo.user_id).select("name email");
    if (ngoUser) {
      await sendNgoVerificationResult({ ngo, ngoUser, approved: false });
    }
    res.json({ msg: "NGO rejected", ngo });
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/donations", async (req, res) => {
  try {
    const donors = await Donor.find().populate("user_id", "name email phone");

    const donations = [];
    donors.forEach((donor) => {
      donor.donations.forEach((donation) => {
        donations.push({
          ...donation.toObject(),
          donor: {
            donor_id: donor._id,
            org_name: donor.org_name,
            user_name: donor.user_id?.name,
            user_email: donor.user_id?.email,
            user_phone: donor.user_id?.phone,
          },
        });
      });
    });

    res.json(donations);
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

router.delete("/donations/:donationId", async (req, res) => {
  try {
    const donationId = req.params.donationId;
    const donor = await Donor.findOne({ "donations._id": donationId });
    if (!donor) return res.status(404).json({ msg: "Donation not found" });

    const donation = donor.donations.id(donationId);
    if (donation?.photos?.length > 0) {
      await Promise.all(donation.photos.map((photo) => deleteStoredAsset(photo)));
    }

    await Accept.deleteMany({ donation_id: donation._id });
    donation.deleteOne();
    await donor.save();

    res.json({ msg: "Donation deleted successfully" });
  } catch (error) {
    console.error("Delete donation error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/top-donors", async (req, res) => {
  try {
    const donors = await Donor.find().populate("user_id", "name email").lean();

    const ranked = donors
      .map((donor) => ({
        name: donor.user_id?.name || "Unknown Donor",
        email: donor.user_id?.email || "N/A",
        totalDonations: donor.donations?.length || 0,
      }))
      .filter((donor) => donor.totalDonations > 0)
      .sort((a, b) => b.totalDonations - a.totalDonations)
      .slice(0, 5);

    res.json(ranked);
  } catch (error) {
    console.error("Top donors error:", error);
    res.status(500).json({ msg: "Failed to load top donors" });
  }
});

router.get("/recent-activity", async (req, res) => {
  try {
    const [recentUsers, recentNGOs, recentDonations] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(5).select("name email role createdAt"),
      NGO.find().sort({ updatedAt: -1 }).limit(5).select("ngo_name status updatedAt"),
      Donor.aggregate([
        { $unwind: "$donations" },
        { $sort: { "donations.createdAt": -1 } },
        { $limit: 5 },
        {
          $project: {
            title: "$donations.title",
            status: "$donations.status",
            createdAt: "$donations.createdAt",
          },
        },
      ]),
    ]);

    const activities = [
      ...recentUsers.map((user) => ({
        type: "User Signup",
        detail: `${user.name} registered as ${user.role}`,
        timestamp: user.createdAt,
      })),
      ...recentNGOs.map((ngo) => ({
        type: "NGO Update",
        detail: `${ngo.ngo_name} is now ${ngo.status}`,
        timestamp: ngo.updatedAt,
      })),
      ...recentDonations.map((donation) => ({
        type: "Donation Added",
        detail: `${donation.title} (${donation.status})`,
        timestamp: donation.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    res.json(activities);
  } catch (error) {
    console.error("Recent activity error:", error);
    res.status(500).json({ msg: "Failed to load activity feed" });
  }
});

module.exports = router;
