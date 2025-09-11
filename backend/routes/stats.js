const express = require("express");
const Donor = require("../models/Donor");
const Accept = require("../models/Accept");
const User = require("../models/User");

const router = express.Router();

// GET /api/stats
router.get("/", async (req, res) => {
  try {
    // ===== Totals =====
    const donorDocs = await Donor.find();
    const totalDonations = donorDocs.reduce((sum, d) => sum + d.donations.length, 0);
    const totalNGOs = await User.countDocuments({ role: "ngo" });
    const delivered = await Accept.countDocuments({ status: "delivered" });

    // Cities → assuming `User` schema has a "city" field (if not, set to 0)
    const ngoCities = await User.distinct("city", { role: "ngo" });
    const cities = ngoCities.length;

    // ===== Weekly Trends =====
    const sixWeeksAgo = new Date();
    sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42);

    // Donations trend (from donor subdocs)
    const donationsTrend = await Donor.aggregate([
      { $unwind: "$donations" },
      { $match: { "donations.createdAt": { $gte: sixWeeksAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$donations.createdAt" },
            week: { $isoWeek: "$donations.createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } }
    ]);

    // Lives impacted trend (from Accept delivered records)
    const livesTrend = await Accept.aggregate([
      { $match: { status: "delivered", updatedAt: { $gte: sixWeeksAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$updatedAt" },
            week: { $isoWeek: "$updatedAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } }
    ]);

    res.json({
      totals: {
        donations: totalDonations,
        ngos: totalNGOs,
        lives: delivered,
        cities,
      },
      trends: {
        donations: donationsTrend,
        lives: livesTrend,
      }
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

module.exports = router;
