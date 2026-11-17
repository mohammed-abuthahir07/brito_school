const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../../config/jwt");
const { findAdminById } = require("../model/adminAuthmodel");
const { parsePositiveInt } = require("../utils/validate");

const unauthorized = (res, message) =>
  res.status(401).json({
    success: false,
    message,
  });

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return unauthorized(res, "Unauthorized: No token provided");
  }

  const token = authHeader.slice(7);

  let payload;
  try {
    payload = jwt.verify(token, getJwtSecret());
  } catch (error) {
    return unauthorized(res, "Unauthorized: Invalid or expired token");
  }

  const adminId = parsePositiveInt(payload && payload.id);
  if (!adminId) {
    return unauthorized(res, "Unauthorized: Invalid or expired token");
  }

  try {
    const admin = await findAdminById(adminId);
    if (!admin) {
      return unauthorized(res, "Unauthorized: Invalid or expired token");
    }

    req.admin = admin;
    return next();
  } catch (error) {
    console.error("Admin token verification database error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = { verifyToken };
