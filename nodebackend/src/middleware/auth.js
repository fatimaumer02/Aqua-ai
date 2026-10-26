/**
 * Reads the "Authorization: Bearer <token>" header, verifies it, and sets
 * req.userId for the route handler to use. Use requireAuth on any route
 * that should only work for a logged-in user.
 */

const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Session expired - please sign in again" });
  }
}

module.exports = { requireAuth };
