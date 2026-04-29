const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password_hash");
      if (!req.user) {
        return res.status(401).json({ msg: "User not found" });
      }
      if (req.user.blocked) {
        return res.status(403).json({ msg: "Your account has been blocked" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ msg: "Token is not valid" });
    }
  }

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }
};

module.exports = protect;  // ✅ Export function directly
