const FALLBACK_SECRET = "your_super_secret_jwt_key_here_12345";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production") {
    if (!secret || secret.length < 16) {
      throw new Error("JWT_SECRET must be configured with a strong value in production");
    }
    return secret;
  }
  return secret || FALLBACK_SECRET;
};

module.exports = { getJwtSecret };
