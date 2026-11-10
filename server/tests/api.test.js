const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs");
const jwt = require("jsonwebtoken");

process.env.NODE_ENV = "test";
process.env.DISABLE_RATE_LIMIT = "true";

const app = require("../server");
const pool = require("../config/db");

let server;
let baseUrl;
let authToken;
const testEmail = "admin@britoschool.com";

// Helper for HTTP requests
async function request(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const headers = { ...options.headers };
  let body = options.body;

  if (body && typeof body === "object" && !(body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
    body = JSON.stringify(body);
  }

  const res = await fetch(url, {
    method: options.method || "GET",
    headers,
    body,
  });

  const contentType = res.headers.get("content-type") || "";
  let data;
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  return {
    status: res.status,
    headers: res.headers,
    data,
  };
}

describe("Brito School Backend API Test Suite", () => {
  before(async () => {
    // Start ephemeral server
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, "127.0.0.1", () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        console.log(`Test server started at ${baseUrl}`);
        resolve();
      });
    });

    // Create a valid JWT token for admin
    const [admins] = await pool.query("SELECT id, email FROM admins WHERE email = ? LIMIT 1", [testEmail]);
    const admin = admins[0] || { id: 1, email: testEmail };

    authToken = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET || "your_super_secret_jwt_key_here_12345",
      { expiresIn: "1h" }
    );
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await pool.end();
  });

  // ==========================================
  // 1. Authentication & Security Middleware
  // ==========================================
  describe("Authentication & Token Verification Middleware", () => {
    test("GET protected endpoint without token returns 401", async () => {
      const res = await request("/api/admin/announcements");
      assert.equal(res.status, 401);
      assert.equal(res.data.success, false);
      assert.equal(res.data.message, "Unauthorized: No token provided");
    });

    test("GET protected endpoint with invalid token returns 401", async () => {
      const res = await request("/api/admin/announcements", {
        headers: { Authorization: "Bearer invalid_token_value_12345" },
      });
      assert.equal(res.status, 401);
      assert.equal(res.data.success, false);
      assert.equal(res.data.message, "Unauthorized: Invalid or expired token");
    });

    test("Security headers are present on responses", async () => {
      const res = await request("/api/admin/login", {
        method: "POST",
        body: {},
      });
      assert.equal(res.headers.get("x-content-type-options"), "nosniff");
      assert.equal(res.headers.get("x-frame-options"), "SAMEORIGIN");
    });

    test("GET /health returns 200 with UP status, DB connectivity, pool, and storage metrics", async () => {
      const res = await request("/health");
      assert.equal(res.status, 200);
      assert.equal(res.data.status, "UP");
      assert.equal(res.data.database.status, "CONNECTED");
      assert.ok(typeof res.data.database.latencyMs === "number");
      assert.ok(typeof res.data.uptimeSeconds === "number");
      assert.ok(res.data.memory.heapUsedMb > 0);
      assert.ok(res.data.storage);
      assert.ok(typeof res.data.storage.freeGb === "number");
      assert.ok(res.data.connectionPool);
      assert.ok(typeof res.data.connectionPool.totalConnections === "number");
    });
  });

  // ==========================================
  // 2. Admin Login & Password Management
  // ==========================================
  describe("Admin Auth Controller", () => {
    test("POST /api/admin/login fails when missing email or password", async () => {
      const res = await request("/api/admin/login", {
        method: "POST",
        body: { email: "admin@britoschool.com" },
      });
      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
      assert.equal(res.data.message, "Email and password are required");
    });

    test("POST /api/admin/login fails with invalid credentials", async () => {
      const res = await request("/api/admin/login", {
        method: "POST",
        body: { email: "nonexistent@britoschool.com", password: "wrongpassword" },
      });
      assert.equal(res.status, 401);
      assert.equal(res.data.success, false);
      assert.equal(res.data.message, "Invalid email or password");
    });

    test("POST /api/admin/forgot-password fails when email is missing", async () => {
      const res = await request("/api/admin/forgot-password", {
        method: "POST",
        body: {},
      });
      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
      assert.equal(res.data.message, "Email address is required");
    });

    test("POST /api/admin/forgot-password returns 404 for unknown email", async () => {
      const res = await request("/api/admin/forgot-password", {
        method: "POST",
        body: { email: "doesnotexist_98765@example.com" },
      });
      assert.equal(res.status, 404);
      assert.equal(res.data.success, false);
      assert.equal(res.data.message, "Admin account not found with this email");
    });

    test("POST /api/admin/reset-password fails when missing fields", async () => {
      const res = await request("/api/admin/reset-password", {
        method: "POST",
        body: { email: testEmail },
      });
      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
      assert.equal(res.data.message, "All fields are required");
    });

    test("POST /api/admin/reset-password fails when passwords do not match", async () => {
      const res = await request("/api/admin/reset-password", {
        method: "POST",
        body: {
          email: testEmail,
          otp: "123456",
          newPassword: "password123",
          confirmPassword: "differentpassword",
        },
      });
      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
      assert.equal(res.data.message, "New password and confirm password do not match");
    });

    test("POST /api/admin/reset-password fails when password length < 6", async () => {
      const res = await request("/api/admin/reset-password", {
        method: "POST",
        body: {
          email: testEmail,
          otp: "123456",
          newPassword: "123",
          confirmPassword: "123",
        },
      });
      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
      assert.equal(res.data.message, "Password must be at least 6 characters long");
    });
  });

  // ==========================================
  // 3. Announcements Controller
  // ==========================================
  describe("Announcements CRUD Controller", () => {
    let createdId;

    test("GET /api/admin/announcements returns list", async () => {
      const res = await request("/api/admin/announcements", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.announcements));
    });

    test("POST /api/admin/announcements validates required fields", async () => {
      const res = await request("/api/admin/announcements", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: { title: "Only Title" },
      });
      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
      assert.equal(res.data.message, "Title and content are required");
    });

    test("POST /api/admin/announcements creates a new announcement", async () => {
      const res = await request("/api/admin/announcements", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: {
          title: "Test Announcement",
          content: "Comprehensive automated test content",
          category: "Academic",
        },
      });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(res.data.announcement);
      assert.equal(res.data.announcement.title, "Test Announcement");
      createdId = res.data.announcement.id;
    });

    test("PUT /api/admin/announcements updates an existing announcement", async () => {
      const res = await request(`/api/admin/announcements?id=${createdId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${authToken}` },
        body: {
          title: "Updated Test Announcement",
          category: "Events",
        },
      });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.announcement.title, "Updated Test Announcement");
    });

    test("PUT /api/admin/announcements fails with missing id query param", async () => {
      const res = await request("/api/admin/announcements", {
        method: "PUT",
        headers: { Authorization: `Bearer ${authToken}` },
        body: { title: "No ID" },
      });
      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
    });

    test("PUT /api/admin/announcements returns 404 for non-existent id", async () => {
      const res = await request("/api/admin/announcements?id=999999", {
        method: "PUT",
        headers: { Authorization: `Bearer ${authToken}` },
        body: { title: "Ghost" },
      });
      assert.equal(res.status, 404);
      assert.equal(res.data.success, false);
      assert.equal(res.data.message, "Announcement not found");
    });

    test("DELETE /api/admin/announcements deletes the announcement", async () => {
      const res = await request(`/api/admin/announcements?id=${createdId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
    });

    test("DELETE /api/admin/announcements returns 404 for non-existent id", async () => {
      const res = await request("/api/admin/announcements?id=999999", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.equal(res.status, 404);
      assert.equal(res.data.success, false);
      assert.equal(res.data.message, "Announcement not found");
    });
  });

  // ==========================================
  // 4. Thirukkural Controller
  // ==========================================
  describe("Thirukkural CRUD Controller", () => {
    let createdKuralId;
    const testKuralNumber = 99991;

    test("GET /api/admin/thirukkural returns list of kurals", async () => {
      const res = await request("/api/admin/thirukkural", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.kurals));
    });

    test("POST /api/admin/thirukkural validates required fields", async () => {
      const res = await request("/api/admin/thirukkural", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: { kural_number: testKuralNumber },
      });
      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
      assert.equal(res.data.message, "kural_number, tamil_text, and english_meaning are required");
    });

    test("POST /api/admin/thirukkural creates a new kural", async () => {
      // Clean up test kural if existing from prior test
      await pool.query("DELETE FROM thirukkural WHERE kural_number = ?", [testKuralNumber]);

      const res = await request("/api/admin/thirukkural", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: {
          kural_number: testKuralNumber,
          tamil_text: "அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு.",
          english_meaning: "As the letter A is the first of all letters, so the eternal God is first in the world.",
          explanation: "Just as 'A' begins the alphabet, God is the source and origin of the cosmos.",
        },
      });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(res.data.kural);
      createdKuralId = res.data.kural.id;
    });

    test("POST /api/admin/thirukkural prevents duplicate kural_number", async () => {
      const res = await request("/api/admin/thirukkural", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: {
          kural_number: testKuralNumber,
          tamil_text: "Duplicate",
          english_meaning: "Duplicate",
        },
      });
      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
      assert.match(res.data.message, /already exists/);
    });

    test("PUT /api/admin/thirukkural updates existing kural", async () => {
      const res = await request(`/api/admin/thirukkural?id=${createdKuralId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${authToken}` },
        body: {
          explanation: "Updated explanation text.",
        },
      });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.kural.explanation, "Updated explanation text.");
    });

    test("PUT /api/admin/thirukkural returns 404 for non-existent id", async () => {
      const res = await request("/api/admin/thirukkural?id=999999", {
        method: "PUT",
        headers: { Authorization: `Bearer ${authToken}` },
        body: { explanation: "Ghost" },
      });
      assert.equal(res.status, 404);
      assert.equal(res.data.success, false);
    });

    test("DELETE /api/admin/thirukkural deletes the kural", async () => {
      const res = await request(`/api/admin/thirukkural?id=${createdKuralId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
    });

    test("DELETE /api/admin/thirukkural returns 404 for non-existent id", async () => {
      const res = await request("/api/admin/thirukkural?id=999999", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.equal(res.status, 404);
      assert.equal(res.data.success, false);
    });
  });

  // ==========================================
  // 5. Calendars Controller
  // ==========================================
  describe("Calendars Controller", () => {
    test("GET /api/admin/calendars returns calendar list", async () => {
      const res = await request("/api/admin/calendars", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.calendars));
    });

    test("POST /api/admin/calendars fails without file or title", async () => {
      const res = await request("/api/admin/calendars", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: { title: "No file" },
      });
      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
    });

    test("POST /api/admin/calendars rejects fake PDF without %PDF magic bytes", async () => {
      const form = new FormData();
      form.append("title", "Fake PDF");
      const fakeBlob = new Blob(["PLAIN_TEXT_NOT_A_REAL_PDF"], { type: "application/pdf" });
      form.append("file", fakeBlob, "fake.pdf");

      const res = await request("/api/admin/calendars", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: form,
      });

      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
      assert.match(res.data.message, /Invalid file content/);
    });

    test("DELETE /api/admin/calendars returns 400 when id is missing", async () => {
      const res = await request("/api/admin/calendars", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
      assert.equal(res.data.message, "Calendar ID is required in query parameters");
    });

    test("DELETE /api/admin/calendars returns 404 for non-existent calendar", async () => {
      const res = await request("/api/admin/calendars?id=999999", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.equal(res.status, 404);
      assert.equal(res.data.success, false);
      assert.equal(res.data.message, "Calendar not found");
    });
  });

  // ==========================================
  // 6. Galleries Controller
  // ==========================================
  describe("Galleries Controller", () => {
    test("GET /api/admin/galleries returns gallery list", async () => {
      const res = await request("/api/admin/galleries", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.galleries));
    });

    test("POST /api/admin/galleries fails without image or title", async () => {
      const res = await request("/api/admin/galleries", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: { title: "No image" },
      });
      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
    });

    test("POST /api/admin/galleries rejects images that are 30 MB or larger", async () => {
      const form = new FormData();
      form.append("title", "Oversized Image");
      const oversized = new Uint8Array(30 * 1024 * 1024);
      oversized[0] = 0xff;
      oversized[1] = 0xd8;
      oversized[2] = 0xff;
      form.append("image", new Blob([oversized], { type: "image/jpeg" }), "big.jpg");

      const res = await request("/api/admin/galleries", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: form,
      });

      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
      assert.equal(
        res.data.message,
        "Image size must be below 30 MB. Please select a smaller image."
      );
    });

    test("POST /api/admin/galleries rejects if any selected image is 30 MB or larger", async () => {
      const form = new FormData();
      form.append("title", "Mixed Images");
      const smallFake = new Blob(["PLAIN_TEXT_NOT_A_REAL_IMAGE"], { type: "image/png" });
      form.append("image", smallFake, "small.png");
      const oversized = new Uint8Array(30 * 1024 * 1024);
      oversized[0] = 0x89;
      oversized[1] = 0x50;
      oversized[2] = 0x4e;
      oversized[3] = 0x47;
      form.append("image", new Blob([oversized], { type: "image/png" }), "big.png");

      const res = await request("/api/admin/galleries", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: form,
      });

      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
      assert.equal(
        res.data.message,
        "Image size must be below 30 MB. Please select a smaller image."
      );
    });

    test("POST /api/admin/galleries rejects fake image without image magic bytes", async () => {
      const form = new FormData();
      form.append("title", "Fake Image");
      const fakeBlob = new Blob(["PLAIN_TEXT_NOT_A_REAL_IMAGE"], { type: "image/png" });
      form.append("image", fakeBlob, "fake.png");

      const res = await request("/api/admin/galleries", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: form,
      });

      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
      assert.match(res.data.message, /Invalid file content/);
    });

    test("DELETE /api/admin/galleries returns 400 when id is missing", async () => {
      const res = await request("/api/admin/galleries", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
      assert.equal(res.data.message, "Gallery ID is required in query parameters");
    });

    test("DELETE /api/admin/galleries returns 404 for non-existent gallery", async () => {
      const res = await request("/api/admin/galleries?id=999999", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.equal(res.status, 404);
      assert.equal(res.data.success, false);
      assert.equal(res.data.message, "Gallery item not found");
    });
  });

  // ==========================================
  // 7. Profile Controller
  // ==========================================
  describe("Admin Profile Controller", () => {
    test("GET /api/admin/profile returns profile", async () => {
      const res = await request("/api/admin/profile", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      // Admin may or may not have a profile yet
      assert.ok(res.status === 200 || res.status === 404);
      if (res.status === 200) {
        assert.equal(res.data.success, true);
        assert.ok(res.data.profile);
      }
    });

    test("POST /api/admin/profile validates required fields", async () => {
      const res = await request("/api/admin/profile", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: { full_name: "Incomplete" },
      });
      assert.equal(res.status, 400);
      assert.equal(res.data.success, false);
      assert.equal(res.data.message, "full_name and alternative_email are required fields");
    });

    test("PUT /api/admin/profile updates profile or returns 404 if not found", async () => {
      const res = await request("/api/admin/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${authToken}` },
        body: { bio: "Updated test bio from test suite" },
      });
      assert.ok(res.status === 200 || res.status === 404);
      if (res.status === 200) {
        assert.equal(res.data.success, true);
      }
    });
  });

  // ==========================================
  // 8. 404 Route Handling
  // ==========================================
  describe("Route Fallback", () => {
    test("Unknown route returns 404 JSON", async () => {
      const res = await request("/api/admin/non-existent-route-xyz");
      assert.equal(res.status, 404);
      assert.equal(res.data.success, false);
      assert.equal(res.data.message, "Endpoint not found");
    });
  });
});
