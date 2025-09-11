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

      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ msg: "User not found" });
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
