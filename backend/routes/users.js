const express = require("express");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/authMiddleware.js");
const User = require("../models/User");
const Donor = require("../models/Donor");
const NGO = require("../models/NGO");

const router = express.Router();

// GET /api/users/me  -> core account + role-bound profile bits
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password_hash -__v");
    if (!user) return res.status(404).json({ msg: "User not found" });

    let profile = null;
    if (user.role === "donor") {
      profile = await Donor.findOne({ user_id: user._id }).select("-__v");
    } else if (user.role === "ngo") {
      profile = await NGO.findOne({ user_id: user._id }).select("-__v");
    }

    res.json({ user, profile });
  } catch (e) {
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/users/me -> update basic user fields and role-specific profile
router.put(
  "/me",
  auth,
  [
    body("name").optional().isLength({ min: 2 }),
    body("phone").optional().isLength({ min: 5 }),
    body("org_name").optional().isString(),
    body("ngo_name").optional().isString(),
    body("registration_no").optional().isString(),
    body("needs_category").optional().isArray(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      // update base user
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: { name: req.body.name, phone: req.body.phone } },
        { new: true, runValidators: true }
      ).select("-password_hash -__v");

      let profile = null;

      if (user.role === "donor") {
        let donor = await Donor.findOne({ user_id: user._id });
        if (!donor) donor = new Donor({ user_id: user._id, org_name: req.body.org_name || "" });
        if (typeof req.body.org_name !== "undefined") donor.org_name = req.body.org_name;
        profile = await donor.save();
      } else if (user.role === "ngo") {
        let ngo = await NGO.findOne({ user_id: user._id });
        if (!ngo) {
          if (!req.body.ngo_name || !req.body.registration_no) {
            return res.status(400).json({ msg: "Provide ngo_name and registration_no to create profile" });
          }
          ngo = new NGO({
            user_id: user._id,
            ngo_name: req.body.ngo_name,
            registration_no: req.body.registration_no,
            needs_category: req.body.needs_category || [],
          });
        } else {
          if (typeof req.body.ngo_name !== "undefined") ngo.ngo_name = req.body.ngo_name;
          if (typeof req.body.registration_no !== "undefined") ngo.registration_no = req.body.registration_no;
          if (typeof req.body.needs_category !== "undefined") ngo.needs_category = req.body.needs_category || [];
        }
        profile = await ngo.save();
      }

      res.json({ msg: "Profile updated", user, profile }); // ✅ frontend expects this
    } catch (e) {
      res.status(500).json({ msg: "Server error" });
    }
  }
);


module.exports = router;
