// Simple role-based guard to use after authMiddleware
module.exports = (...allowedRoles) => (req, res, next) => {
  if (!req.user?.role) {
    return res.status(401).json({ msg: "Unauthorized" });
  }
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ msg: "Forbidden: Insufficient role" });
  }
  next();
};
