const express = require("express");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/authMiddleware.js");
const upload = require("../middleware/uploadMiddleware.js");
const User = require("../models/User");
const Donor = require("../models/Donor");
const NGO = require("../models/NGO");
const {
  deleteStoredAsset,
  storeUploadedFile,
} = require("../services/storageService");

const router = express.Router();

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
  } catch (error) {
    console.error("GET /users/me error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

router.put(
  "/me",
  auth,
  upload.single("certificate"),
  [
    body("name").optional().isLength({ min: 2 }),
    body("phone").optional().isLength({ min: 5 }),
    body("org_name").optional().isString(),
    body("ngo_name").optional().isString(),
    body("registration_no").optional().isString(),
  ],
  async (req, res) => {
    let newCertificateUrl = "";
    let previousCertificateUrl = "";

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: { name: req.body.name, phone: req.body.phone } },
        { new: true, runValidators: true }
      ).select("-password_hash -__v");

      if (!user) return res.status(404).json({ msg: "User not found" });

      let profile = null;

      if (user.role === "donor") {
        let donor = await Donor.findOne({ user_id: user._id });
        if (!donor) {
          donor = new Donor({ user_id: user._id, org_name: req.body.org_name || "" });
        }

        if (typeof req.body.org_name !== "undefined") {
          donor.org_name = req.body.org_name;
        }

        profile = await donor.save();
      } else if (user.role === "ngo") {
        let ngo = await NGO.findOne({ user_id: user._id });

        let parsedNeeds = [];
        if (Array.isArray(req.body["needs_category[]"])) {
          parsedNeeds = req.body["needs_category[]"];
        } else if (typeof req.body["needs_category[]"] === "string") {
          parsedNeeds = [req.body["needs_category[]"]];
        } else if (Array.isArray(req.body.needs_category)) {
          parsedNeeds = req.body.needs_category;
        } else if (
          typeof req.body.needs_category === "string" &&
          req.body.needs_category.length
        ) {
          parsedNeeds = req.body.needs_category
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
        }

        if (req.file) {
          newCertificateUrl = await storeUploadedFile(req.file, {
            folder: "needo/ngo-certificates",
          });
        }

        if (!ngo) {
          if (!req.body.ngo_name || !req.body.registration_no) {
            if (newCertificateUrl) {
              await deleteStoredAsset(newCertificateUrl);
            }
            return res
              .status(400)
              .json({ msg: "Provide ngo_name and registration_no to create profile" });
          }

          ngo = new NGO({
            user_id: user._id,
            ngo_name: req.body.ngo_name,
            registration_no: req.body.registration_no,
            needs_category: parsedNeeds || [],
            certificateUrl: newCertificateUrl || "",
            status: "pending",
            verified: false,
          });
        } else {
          if (typeof req.body.ngo_name !== "undefined") {
            ngo.ngo_name = req.body.ngo_name;
          }
          if (typeof req.body.registration_no !== "undefined") {
            ngo.registration_no = req.body.registration_no;
          }
          if (parsedNeeds.length > 0) {
            ngo.needs_category = parsedNeeds;
          }

          if (newCertificateUrl) {
            previousCertificateUrl = ngo.certificateUrl || "";
            ngo.certificateUrl = newCertificateUrl;
            ngo.status = "pending";
            ngo.verified = false;
            ngo.verifiedBy = null;
            ngo.verifiedAt = null;
          }
        }

        profile = await ngo.save();

        if (
          previousCertificateUrl &&
          newCertificateUrl &&
          previousCertificateUrl !== newCertificateUrl
        ) {
          await deleteStoredAsset(previousCertificateUrl);
        }
      }

      res.json({ msg: "Profile updated", user, profile });
    } catch (error) {
      if (newCertificateUrl) {
        await deleteStoredAsset(newCertificateUrl);
      }
      console.error("PUT /users/me error:", error);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

module.exports = router;
