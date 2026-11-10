/**
 * Parse a positive integer from query/body values.
 * Returns null when the value is missing or not a clean base-10 integer.
 */
const parsePositiveInt = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const asString = String(value).trim();
  if (!/^\d+$/.test(asString)) {
    return null;
  }
  const parsed = Number.parseInt(asString, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

/**
 * Optional list pagination. Omitting limit preserves the existing
 * "return all rows" contract used by the frontend.
 */
const parseListPagination = (query = {}) => {
  const limit = parsePositiveInt(query.limit);
  if (!limit) {
    return null;
  }
  const page = parsePositiveInt(query.page) || 1;
  const safeLimit = Math.min(limit, 500);
  return {
    limit: safeLimit,
    offset: (page - 1) * safeLimit,
  };
};

module.exports = {
  parsePositiveInt,
  parseListPagination,
};
