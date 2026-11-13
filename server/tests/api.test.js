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

    test("GET /health/live returns 200 without requiring the database payload internals", async () => {
      const res = await request("/health/live");
      assert.equal(res.status, 200);
      assert.equal(res.data.status, "UP");
      assert.ok(typeof res.data.uptimeSeconds === "number");
      assert.equal(res.data.database, undefined);
    });

    test("GET /health/ready returns 200 when the database is reachable", async () => {
      const res = await request("/health/ready");
      assert.equal(res.status, 200);
      assert.equal(res.data.status, "UP");
      assert.equal(res.data.database.status, "CONNECTED");
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

    test("POST /api/admin/thirukkural replaces the same-day active record instead of duplicating", async () => {
      const res = await request("/api/admin/thirukkural", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: {
          kural_number: testKuralNumber,
          tamil_text: "Replaced Tamil",
          english_meaning: "Replaced English",
        },
      });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.equal(res.data.kural.id, createdKuralId);
      assert.equal(res.data.kural.english_meaning, "Replaced English");

      const [rows] = await pool.query("SELECT COUNT(*) AS total FROM thirukkural");
      assert.equal(Number(rows[0].total), 1);
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

    test("POST /api/admin/calendars accepts any file type including image files", async () => {
      const form = new FormData();
      form.append("title", "Academic Calendar Image");
      form.append("description", "Full year schedule");
      const fakeJpg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
      form.append("file", new Blob([fakeJpg], { type: "image/jpeg" }), "calendar.jpg");

      const res = await request("/api/admin/calendars", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: form,
      });

      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(res.data.calendar);
      assert.equal(res.data.calendar.title, "Academic Calendar Image");

      // Cleanup created calendar
      if (res.data.calendar.id) {
        await request(`/api/admin/calendars?id=${res.data.calendar.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${authToken}` },
        });
      }
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

    test("POST /api/admin/galleries accepts file upload with field name 'file' (abuthahir1.jpg scenario)", async () => {
      const form = new FormData();
      form.append("title", "Academic Calendar Gallery");
      form.append("description", "Full academic year schedulee");
      const fakeJpg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
      // Use field name 'file' exactly like user did in Postman
      form.append("file", new Blob([fakeJpg], { type: "image/jpeg" }), "abuthahir1.jpg");

      const res = await request("/api/admin/galleries", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: form,
      });

      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(res.data.gallery);
      assert.equal(res.data.gallery.title, "Academic Calendar Gallery");

      // Cleanup created gallery
      if (res.data.gallery.id) {
        await request(`/api/admin/galleries?id=${res.data.gallery.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${authToken}` },
        });
      }
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
    test("GET /api/admin/profile without token returns 401", async () => {
      const res = await request("/api/admin/profile");
      assert.equal(res.status, 401);
      assert.equal(res.data.success, false);
    });

    test("GET /api/admin/profile returns 200 with valid token", async () => {
      const res = await request("/api/admin/profile", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(res.data.profile);
      assert.ok(res.data.profile.email);
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

    test("POST /api/admin/profile updates profile data", async () => {
      const res = await request("/api/admin/profile", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: {
          full_name: "Test Admin",
          alternative_email: "testadmin@britoschool.com",
          phone_primary: "9876543210",
          School_location: "Chennai",
        },
      });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(res.data.profile);
      assert.equal(res.data.profile.full_name, "Test Admin");
    });

    test("PUT /api/admin/profile updates profile and returns 200", async () => {
      const res = await request("/api/admin/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${authToken}` },
        body: { full_name: "Updated Admin Name", School_location: "Updated Location" },
      });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(res.data.profile);
      assert.equal(res.data.profile.full_name, "Updated Admin Name");
    });

    test("DELETE /api/admin/profile returns 404 (endpoint removed)", async () => {
      const res = await request("/api/admin/profile", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.equal(res.status, 404);
      assert.equal(res.data.success, false);
      assert.equal(res.data.message, "Endpoint not found");
    });
  });

  // ==========================================
  // 8. Dashboard Controller
  // ==========================================
  describe("Dashboard Controller", () => {
    test("GET /api/admin/dashboard without token returns 401", async () => {
      const res = await request("/api/admin/dashboard");
      assert.equal(res.status, 401);
      assert.equal(res.data.success, false);
    });

    test("GET /api/admin/dashboard with valid token returns 200", async () => {
      const res = await request("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(res.data.dashboard);
    });

    test("GET /api/admin/dashboard has correct structure", async () => {
      const res = await request("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.equal(res.status, 200);
      const { dashboard } = res.data;
      assert.ok(dashboard.announcements);
      assert.ok(dashboard.calendars);
      assert.ok(dashboard.galleries);
      assert.ok(dashboard.thirukkural);
      assert.ok(dashboard.generatedAt);
    });

    test("GET /api/admin/dashboard counts are numbers", async () => {
      const res = await request("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.equal(res.status, 200);
      const { dashboard } = res.data;
      assert.ok(typeof dashboard.announcements.total === "number");
      assert.ok(typeof dashboard.calendars.total === "number");
      assert.ok(typeof dashboard.galleries.total === "number");
      assert.ok(typeof dashboard.thirukkural.total === "number");
    });

    test("GET /api/admin/dashboard announcements has byCategory array", async () => {
      const res = await request("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.data.dashboard.announcements.byCategory));
    });
  });

  // ==========================================
  // 9. Public Content APIs & Conditional ETag Caching
  // ==========================================
  describe("Public Content APIs & Caching", () => {
    test("GET /api/public/announcements returns 200 without token and includes ETag header", async () => {
      const res = await request("/api/public/announcements");
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.announcements));
      assert.ok(res.headers.get("etag"));
      assert.ok(res.headers.get("cache-control").includes("public"));
    });

    test("GET /api/public/announcements returns 304 Not Modified when If-None-Match matches ETag", async () => {
      const first = await request("/api/public/announcements");
      const etag = first.headers.get("etag");
      assert.ok(etag);

      const second = await request("/api/public/announcements", {
        headers: { "If-None-Match": etag },
      });
      assert.equal(second.status, 304);
    });

    test("GET /api/public/calendars returns 200 without token", async () => {
      const res = await request("/api/public/calendars");
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.calendars));
    });

    test("GET /api/public/galleries returns 200 without token", async () => {
      const res = await request("/api/public/galleries");
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.galleries));
    });

    test("GET /api/public/thirukkural returns 200 without token", async () => {
      const res = await request("/api/public/thirukkural");
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(Array.isArray(res.data.kurals));
    });

    test("GET /api/public/thirukkural/daily returns 200 without token", async () => {
      const res = await request("/api/public/thirukkural/daily");
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
      assert.ok(Object.prototype.hasOwnProperty.call(res.data, "kural"));
    });

    test("Aliased route GET /api/announcements works publicly without token", async () => {
      const res = await request("/api/announcements");
      assert.equal(res.status, 200);
      assert.equal(res.data.success, true);
    });
  });

  // ==========================================
  // 10. Admin Write + Public Read Consistency & Cache Invalidation
  // ==========================================
  describe("Admin Write + Public Read Consistency (Mandatory Workflow)", () => {
    test("Thirukkural Workflow: Admin Create -> Public Read -> Admin Update -> Public Read -> Admin Delete -> Public Verify", async () => {
      const testKuralNumber = 9988;

      // 1. Admin adds new Thirukkural
      const createRes = await request("/api/admin/thirukkural", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: {
          kural_number: testKuralNumber,
          tamil_text: "அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு",
          english_meaning: "As the letter A is the first of all letters, so the eternal God is first in the world.",
          explanation: "Initial test explanation",
        },
      });
      assert.equal(createRes.status, 200);
      assert.equal(createRes.data.success, true);
      const kuralId = createRes.data.kural.id;

      // 2. Public visitor retrieves Thirukkural
      const publicRead1 = await request("/api/public/thirukkural");
      assert.equal(publicRead1.status, 200);
      const foundInPublic = publicRead1.data.kurals.find((k) => k.kural_number === testKuralNumber);
      assert.ok(foundInPublic, "Public visitor must see the newly created Thirukkural");
      assert.equal(foundInPublic.explanation, "Initial test explanation");

      // 3. Admin updates the Thirukkural
      const updateRes = await request(`/api/admin/thirukkural?id=${kuralId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${authToken}` },
        body: {
          explanation: "Updated explanation by admin",
        },
      });
      assert.equal(updateRes.status, 200);

      // 4. Public visitor retrieves the updated Thirukkural (verifying instant cache invalidation)
      const publicRead2 = await request("/api/public/thirukkural");
      assert.equal(publicRead2.status, 200);
      const foundUpdated = publicRead2.data.kurals.find((k) => k.kural_number === testKuralNumber);
      assert.ok(foundUpdated);
      assert.equal(foundUpdated.explanation, "Updated explanation by admin", "Cache must invalidate and return updated explanation");

      // 5. Admin deletes the isolated test entry
      const deleteRes = await request(`/api/admin/thirukkural?id=${kuralId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.equal(deleteRes.status, 200);

      // 6. Public visitor receives the correct updated result without the deleted entry
      const publicRead3 = await request("/api/public/thirukkural");
      assert.equal(publicRead3.status, 200);
      const foundDeleted = publicRead3.data.kurals.find((k) => k.kural_number === testKuralNumber);
      assert.equal(foundDeleted, undefined, "Deleted Thirukkural must not appear in public read");
    });

    test("Announcements Workflow: Admin Create -> Public Read -> Admin Update -> Public Read -> Admin Delete -> Public Verify", async () => {
      // 1. Admin adds announcement
      const createRes = await request("/api/admin/announcements", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: {
          title: "Public Read Consistency Test",
          content: "Initial announcement content",
          category: "Exam",
        },
      });
      assert.equal(createRes.status, 200);
      const announcementId = createRes.data.announcement.id;

      // 2. Public visitor reads
      const read1 = await request("/api/public/announcements");
      assert.equal(read1.status, 200);
      const item1 = read1.data.announcements.find((a) => a.id === announcementId);
      assert.ok(item1);
      assert.equal(item1.title, "Public Read Consistency Test");

      // 3. Admin updates announcement
      const updateRes = await request(`/api/admin/announcements?id=${announcementId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${authToken}` },
        body: {
          title: "Public Read Consistency Test - UPDATED",
        },
      });
      assert.equal(updateRes.status, 200);

      // 4. Public visitor verifies updated title (cache invalidation check)
      const read2 = await request("/api/public/announcements");
      assert.equal(read2.status, 200);
      const item2 = read2.data.announcements.find((a) => a.id === announcementId);
      assert.ok(item2);
      assert.equal(item2.title, "Public Read Consistency Test - UPDATED");

      // 5. Admin deletes announcement
      const deleteRes = await request(`/api/admin/announcements?id=${announcementId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.equal(deleteRes.status, 200);

      // 6. Public visitor verifies item is gone
      const read3 = await request("/api/public/announcements");
      assert.equal(read3.status, 200);
      const item3 = read3.data.announcements.find((a) => a.id === announcementId);
      assert.equal(item3, undefined);
    });
  });

  // ==========================================
  // 11. 404 Route Handling
  // ==========================================
  describe("Gallery Capacity Business Rule (max 30)", () => {
    const CAPACITY_TITLE_PREFIX = "Capacity Test Image";
    const miniJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);

    const uploadMiniJpeg = async (title) => {
      const form = new FormData();
      form.append("title", title);
      form.append("image", new Blob([miniJpeg], { type: "image/jpeg" }), "cap.jpg");
      return request("/api/admin/galleries", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: form,
      });
    };

    after(async () => {
      await pool.query("DELETE FROM galleries WHERE title LIKE ?", [`${CAPACITY_TITLE_PREFIX}%`]);
    });

    test("uploads succeed through the 30th image and reject the 31st", async () => {
      await pool.query("DELETE FROM galleries WHERE title LIKE ?", [`${CAPACITY_TITLE_PREFIX}%`]);

      for (let i = 1; i <= 29; i += 1) {
        await pool.query(
          "INSERT INTO galleries (title, description, image_path) VALUES (?, ?, ?)",
          [`${CAPACITY_TITLE_PREFIX} ${i}`, "seed", `/uploads/galleries/capacity-seed-${i}.jpg`]
        );
      }

      const thirtieth = await uploadMiniJpeg(`${CAPACITY_TITLE_PREFIX} 30`);
      assert.equal(thirtieth.status, 200);
      assert.equal(thirtieth.data.success, true);
      assert.equal(thirtieth.data.total, 30);
      assert.equal(thirtieth.data.remaining, 0);
      const thirtiethId = thirtieth.data.gallery.id;

      const thirtyFirst = await uploadMiniJpeg(`${CAPACITY_TITLE_PREFIX} 31`);
      assert.equal(thirtyFirst.status, 409);
      assert.equal(thirtyFirst.data.success, false);
      assert.equal(
        thirtyFirst.data.message,
        "Maximum gallery capacity reached. Only 30 images are allowed. Please delete an existing image before uploading another."
      );

      const [countAtCap] = await pool.query("SELECT COUNT(*) AS total FROM galleries");
      assert.equal(Number(countAtCap[0].total), 30);

      const publicAtCap = await request("/api/public/galleries");
      assert.ok(publicAtCap.data.galleries.length <= 30);

      const deleted = await request(`/api/admin/galleries?id=${thirtiethId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert.equal(deleted.status, 200);
      assert.equal(deleted.data.total, 29);
      assert.equal(deleted.data.remaining, 1);

      const replacement = await uploadMiniJpeg(`${CAPACITY_TITLE_PREFIX} replacement`);
      assert.equal(replacement.status, 200);
      assert.equal(replacement.data.total, 30);

      const updateRes = await request(`/api/admin/galleries?id=${replacement.data.gallery.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${authToken}` },
        body: (() => {
          const form = new FormData();
          form.append("title", `${CAPACITY_TITLE_PREFIX} updated`);
          form.append("image", new Blob([miniJpeg], { type: "image/jpeg" }), "updated.jpg");
          return form;
        })(),
      });
      assert.equal(updateRes.status, 200);
      assert.equal(updateRes.data.total, 30);
    });

    test("concurrent uploads at 29 images never produce more than 30 rows", async () => {
      await pool.query("DELETE FROM galleries WHERE title LIKE ?", [`${CAPACITY_TITLE_PREFIX}%`]);

      for (let i = 1; i <= 29; i += 1) {
        await pool.query(
          "INSERT INTO galleries (title, description, image_path) VALUES (?, ?, ?)",
          [`${CAPACITY_TITLE_PREFIX} concurrent ${i}`, "seed", `/uploads/galleries/capacity-concurrent-${i}.jpg`]
        );
      }

      const [first, second] = await Promise.all([
        uploadMiniJpeg(`${CAPACITY_TITLE_PREFIX} concurrent A`),
        uploadMiniJpeg(`${CAPACITY_TITLE_PREFIX} concurrent B`),
      ]);

      const statuses = [first.status, second.status].sort();
      assert.equal(statuses[0], 200);
      assert.equal(statuses[1], 409);

      const [countRows] = await pool.query("SELECT COUNT(*) AS total FROM galleries");
      assert.ok(Number(countRows[0].total) <= 30);
      assert.equal(Number(countRows[0].total), 30);
    });
  });

  describe("Daily Thirukkural Business Rule (one active record)", () => {
    after(async () => {
      await pool.query("DELETE FROM thirukkural WHERE kural_number IN (?, ?, ?)", [88001, 88002, 88003]);
    });

    test("same-day second upload replaces the current record and keeps a single row", async () => {
      await pool.query("DELETE FROM thirukkural WHERE kural_number IN (?, ?, ?)", [88001, 88002, 88003]);

      const first = await request("/api/admin/thirukkural", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "X-Test-Kolkata-Date": "2026-11-13",
        },
        body: {
          kural_number: 88001,
          tamil_text: "Day 1 original",
          english_meaning: "Day 1 original meaning",
          explanation: "A",
        },
      });
      assert.equal(first.status, 200);
      const firstId = first.data.kural.id;

      const public1 = await request("/api/public/thirukkural");
      assert.equal(public1.data.count, 1);
      assert.equal(public1.data.kurals.length, 1);
      assert.equal(public1.data.kurals[0].kural_number, 88001);

      const second = await request("/api/admin/thirukkural", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "X-Test-Kolkata-Date": "2026-11-13",
        },
        body: {
          kural_number: 88002,
          tamil_text: "Day 1 replacement",
          english_meaning: "Day 1 replacement meaning",
          explanation: "B",
        },
      });
      assert.equal(second.status, 200);
      assert.equal(second.data.kural.id, firstId);
      assert.equal(second.data.kural.kural_number, 88002);

      const [countSameDay] = await pool.query("SELECT COUNT(*) AS total FROM thirukkural");
      assert.equal(Number(countSameDay[0].total), 1);

      const public2 = await request("/api/public/thirukkural/daily");
      assert.equal(public2.data.kural.kural_number, 88002);
    });

    test("next-day upload replaces the previous active record", async () => {
      const nextDay = await request("/api/admin/thirukkural", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "X-Test-Kolkata-Date": "2026-11-14",
        },
        body: {
          kural_number: 88003,
          tamil_text: "Day 2 verse",
          english_meaning: "Day 2 meaning",
          explanation: "C",
        },
      });
      assert.equal(nextDay.status, 200);
      assert.equal(nextDay.data.kural.kural_number, 88003);

      const [rows] = await pool.query("SELECT kural_number FROM thirukkural");
      assert.equal(rows.length, 1);
      assert.equal(rows[0].kural_number, 88003);

      const publicDaily = await request("/api/public/thirukkural/daily");
      assert.equal(publicDaily.data.kural.kural_number, 88003);
    });

    test("validation failure does not delete the current valid Thirukkural", async () => {
      const before = await request("/api/public/thirukkural/daily");
      assert.ok(before.data.kural);

      const failed = await request("/api/admin/thirukkural", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: { kural_number: 88099 },
      });
      assert.equal(failed.status, 400);

      const after = await request("/api/public/thirukkural/daily");
      assert.equal(after.data.kural.id, before.data.kural.id);
      assert.equal(after.data.kural.kural_number, before.data.kural.kural_number);
    });

    test("simultaneous same-day uploads still leave a single active record", async () => {
      const [a, b] = await Promise.all([
        request("/api/admin/thirukkural", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "X-Test-Kolkata-Date": "2026-11-15",
          },
          body: {
            kural_number: 88111,
            tamil_text: "Concurrent A",
            english_meaning: "Concurrent A meaning",
          },
        }),
        request("/api/admin/thirukkural", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "X-Test-Kolkata-Date": "2026-11-15",
          },
          body: {
            kural_number: 88112,
            tamil_text: "Concurrent B",
            english_meaning: "Concurrent B meaning",
          },
        }),
      ]);

      assert.equal(a.status, 200);
      assert.equal(b.status, 200);
      const [countRows] = await pool.query("SELECT COUNT(*) AS total FROM thirukkural");
      assert.equal(Number(countRows[0].total), 1);
    });
  });

  describe("Route Fallback", () => {
    test("Unknown route returns 404 JSON", async () => {
      const res = await request("/api/admin/non-existent-route-xyz");
      assert.equal(res.status, 404);
      assert.equal(res.data.success, false);
      assert.equal(res.data.message, "Endpoint not found");
    });
  });
});
