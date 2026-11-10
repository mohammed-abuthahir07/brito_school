const fs = require("fs");
const path = require("path");

const uploadsRoot = path.resolve(__dirname, "../../uploads");
const uploadsRootWithSep = uploadsRoot.endsWith(path.sep)
  ? uploadsRoot
  : uploadsRoot + path.sep;

const resolveSafeUploadPath = (storedPath) => {
  if (!storedPath || typeof storedPath !== "string") {
    return null;
  }

  const candidate = path.isAbsolute(storedPath)
    ? path.resolve(storedPath)
    : path.resolve(__dirname, "../../", storedPath.replace(/^[/\\]+/, ""));

  if (candidate !== uploadsRoot && !candidate.startsWith(uploadsRootWithSep)) {
    return null;
  }

  return candidate;
};

const unlinkUpload = async (storedPath) => {
  const resolved = resolveSafeUploadPath(storedPath);
  if (!resolved) {
    return;
  }

  try {
    await fs.promises.unlink(resolved);
  } catch (fileErr) {
    if (fileErr.code !== "ENOENT") {
      console.warn("Notice: could not unlink file:", fileErr.message);
    }
  }
};

module.exports = {
  resolveSafeUploadPath,
  unlinkUpload,
};
