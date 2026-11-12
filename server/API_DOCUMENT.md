# Brito School Management System — API Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Authentication](#2-authentication)
3. [Standard Response Format](#3-standard-response-format)
4. [Error Codes](#4-error-codes)
5. [Rate Limiting](#5-rate-limiting)
6. [Security Headers](#6-security-headers)
7. [API Endpoints](#7-api-endpoints)
   - [System](#system)
   - [Authentication](#auth-endpoints)
   - [Dashboard](#dashboard)
   - [Announcements](#announcements)
   - [Calendars](#calendars)
   - [Galleries](#galleries)
   - [Thirukkural](#thirukkural)
   - [Admin Profile](#admin-profile)
   - [Static Files](#static-files)
8. [Postman Testing Guide](#8-postman-testing-guide)
9. [Database Schema](#9-database-schema)
10. [Postman Collection JSON](#10-postman-collection-json)

---

## 1. Project Overview

**Brito School Management System** is a RESTful backend API for managing school administration operations including announcements, academic calendars, photo galleries, Thirukkural literature, and admin profile management.

| Item | Detail |
|------|--------|
| **Runtime** | Node.js 18+ |
| **Framework** | Express.js |
| **Database** | MySQL 8+ |
| **Auth** | JWT (Bearer token) |
| **Base URL** | `http://localhost:5000` |
| **User Role** | Admin only |

---

## 2. Authentication

The API uses **JWT Bearer Token** authentication.

### Getting a Token

```http
POST /api/admin/login
```

```json
{
  "email": "admin@britoschool.com",
  "password": "admin@123"
}
```

Response includes a `token` field. Use it in subsequent requests:

```http
Authorization: Bearer <your-token-here>
```

- Token expiry: **1 day**
- All endpoints except `POST /api/admin/login`, `POST /api/admin/forgot-password`, `POST /api/admin/reset-password`, and `GET /health` require a valid token.

---

## 3. Standard Response Format

### Success

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Failure

```json
{
  "success": false,
  "message": "Description of what went wrong"
}
```

---

## 4. Error Codes

| Code | Meaning |
|------|---------|
| `400` | Bad Request — missing or invalid input fields |
| `401` | Unauthorized — missing, invalid, or expired token |
| `404` | Not Found — resource does not exist |
| `429` | Too Many Requests — rate limit exceeded |
| `500` | Internal Server Error — unexpected server failure |
| `503` | Service Unavailable — DB unreachable or server busy |

---

## 5. Rate Limiting

| Route Group | Limit |
|-------------|-------|
| Auth routes (`/login`, `/forgot-password`, `/reset-password`) | 30 requests / 15 minutes |
| All other `/api/*` routes | 1000 requests / 15 minutes |

When exceeded, the API returns HTTP `429` with:

```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```

---

## 6. Security Headers

Every response includes these security headers:

| Header | Value |
|--------|-------|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `X-XSS-Protection` | `0` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-Powered-By` | *(removed)* |

---

## 7. API Endpoints

---

### System

#### `GET /health`

Returns the server health status including database connectivity, memory usage, connection pool, and disk storage metrics.

**Auth:** Not required

**Success Response (200):**
```json
{
  "status": "UP",
  "timestamp": "2026-11-12T05:22:00.000Z",
  "uptimeSeconds": 3600,
  "database": {
    "status": "CONNECTED",
    "latencyMs": 1.23
  },
  "connectionPool": {
    "totalConnections": 2,
    "freeConnections": 2,
    "waitingRequests": 0
  },
  "storage": {
    "freeGb": 45.60,
    "totalGb": 100.00,
    "usagePercent": 54.4
  },
  "memory": {
    "rssMb": 55.21,
    "heapUsedMb": 22.10,
    "heapTotalMb": 35.00
  }
}
```

**Degraded Response (503):** when DB is unreachable, `status` = `"DEGRADED"`.

---

### Auth Endpoints

#### `POST /api/admin/login`

Authenticates the admin and returns a JWT token.

**Auth:** Not required

**Request Body:**
```json
{
  "email": "admin@britoschool.com",
  "password": "admin@123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| `400` | `"Email and password are required"` |
| `401` | `"Invalid email or password"` |

---

#### `POST /api/admin/forgot-password`

Sends a one-time password (OTP) to the admin's registered email for password reset.

**Auth:** Not required

**Request Body:**
```json
{
  "email": "admin@britoschool.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP sent to your email address"
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| `400` | `"Email address is required"` |
| `404` | `"Admin account not found with this email"` |

---

#### `POST /api/admin/reset-password`

Resets the admin password using the OTP received by email.

**Auth:** Not required

**Request Body:**
```json
{
  "email": "admin@britoschool.com",
  "otp": "123456",
  "newPassword": "newSecurePass123",
  "confirmPassword": "newSecurePass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| `400` | `"All fields are required"` |
| `400` | `"New password and confirm password do not match"` |
| `400` | `"Password must be at least 6 characters long"` |
| `400` | `"Invalid or expired OTP"` |
| `404` | `"Admin account not found with this email"` |

---

### Dashboard

#### `GET /api/admin/dashboard`

Returns aggregated real-time statistics from all content tables. All queries are executed in parallel using `Promise.all` for efficiency.

**Auth:** Required

**Success Response (200):**
```json
{
  "success": true,
  "dashboard": {
    "announcements": {
      "total": 12,
      "byCategory": [
        { "category": "Academic", "count": 5 },
        { "category": "Events", "count": 4 },
        { "category": "General", "count": 3 }
      ],
      "latest": {
        "id": 12,
        "title": "Annual Day Celebration",
        "category": "Events",
        "created_at": "2026-11-10T08:30:00.000Z"
      }
    },
    "calendars": {
      "total": 3,
      "latest": {
        "id": 3,
        "title": "Academic Calendar 2026-27",
        "created_at": "2026-10-01T10:00:00.000Z"
      }
    },
    "galleries": {
      "total": 25,
      "latest": {
        "id": 25,
        "title": "Sports Day 2026",
        "created_at": "2026-11-05T14:00:00.000Z"
      }
    },
    "thirukkural": {
      "total": 1330,
      "latest": {
        "id": 1330,
        "kural_number": 1330,
        "created_at": "2026-09-01T09:00:00.000Z"
      }
    },
    "generatedAt": "2026-11-12T10:50:00.000Z"
  }
}
```

When a table is empty, `latest` will be `null` and `total` will be `0`.

**Error Responses:**

| Status | Message |
|--------|---------|
| `401` | `"Unauthorized: No token provided"` |
| `500` | `"Server Error"` |

---

### Announcements

#### `GET /api/admin/announcements`

Returns all announcements ordered by most recent first.

**Auth:** Required

**Query Parameters (optional):**

| Param | Type | Description |
|-------|------|-------------|
| `limit` | integer | Max records to return (default: all) |
| `offset` | integer | Pagination offset |

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "announcements": [
    {
      "id": 2,
      "title": "Annual Day Celebration",
      "content": "Annual day will be celebrated on November 20th.",
      "category": "Events",
      "created_at": "2026-11-10T08:30:00.000Z",
      "updated_at": "2026-11-10T08:30:00.000Z"
    },
    {
      "id": 1,
      "title": "School Reopens",
      "content": "School will reopen after Diwali holidays on November 5th.",
      "category": "General",
      "created_at": "2026-10-28T09:00:00.000Z",
      "updated_at": "2026-10-28T09:00:00.000Z"
    }
  ]
}
```

---

#### `POST /api/admin/announcements`

Creates a new announcement.

**Auth:** Required

**Request Body:**
```json
{
  "title": "School Reopens",
  "content": "School will reopen after Diwali holidays on November 5th.",
  "category": "General"
}
```

> `category` is optional. Defaults to `"General"` if not provided.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Announcement created successfully!",
  "announcement": {
    "id": 1,
    "title": "School Reopens",
    "content": "School will reopen after Diwali holidays on November 5th.",
    "category": "General"
  }
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| `400` | `"Title and content are required"` |
| `401` | `"Unauthorized: No token provided"` |

---

#### `PUT /api/admin/announcements?id=:id`

Updates an existing announcement by ID.

**Auth:** Required

**Query Params:** `id` (integer, required)

**Request Body:** *(all fields optional — omitted fields retain current value)*
```json
{
  "title": "Updated Title",
  "content": "Updated content text.",
  "category": "Academic"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Announcement ID 1 updated successfully!",
  "announcement": {
    "id": 1,
    "title": "Updated Title",
    "content": "Updated content text.",
    "category": "Academic",
    "created_at": "2026-10-28T09:00:00.000Z",
    "updated_at": "2026-10-28T09:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| `400` | `"Announcement ID is required in query parameters"` |
| `404` | `"Announcement not found"` |

---

#### `DELETE /api/admin/announcements?id=:id`

Deletes an announcement by ID.

**Auth:** Required

**Query Params:** `id` (integer, required)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Announcement ID 1 deleted successfully!"
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| `400` | `"Announcement ID is required in query parameters"` |
| `404` | `"Announcement not found"` |

---

### Calendars

#### `GET /api/admin/calendars`

Returns all academic calendar entries.

**Auth:** Required

**Success Response (200):**
```json
{
  "success": true,
  "count": 1,
  "calendars": [
    {
      "id": 1,
      "title": "Academic Calendar 2026-27",
      "description": "Full academic year schedule",
      "file_path": "uploads/calendars/1699789200000-calendar.pdf",
      "file_url": "/uploads/calendars/1699789200000-calendar.pdf",
      "created_at": "2026-10-01T10:00:00.000Z",
      "updated_at": "2026-10-01T10:00:00.000Z"
    }
  ]
}
```

---

#### `POST /api/admin/calendars`

Uploads a new academic calendar file. Accepts any file type (PDF, JPG, PNG, WEBP, DOC, DOCX, etc., max 30 MB). Uses `multipart/form-data`.

**Auth:** Required

**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Calendar title |
| `description` | string | No | Optional description |
| `file` (or `image`) | file | Yes | Any calendar file (PDF, JPG, PNG, etc., max 30 MB) |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Calendar file uploaded successfully!",
  "calendar": {
    "id": 1,
    "title": "Academic Calendar 2026-27",
    "description": "Full academic year schedule",
    "file_url": "/uploads/calendars/calendar-1699789200000-123456789.jpg"
  }
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| `400` | `"Title and a file are required via form-data"` |
| `400` | `"File size must be below 30 MB. Please select a smaller file."` |
| `400` | `"Invalid file content: Uploaded file is not a valid PDF document."` (if claimed extension is .pdf but content is corrupt) |

---

#### `DELETE /api/admin/calendars?id=:id`

Deletes a calendar entry and its associated file.

**Auth:** Required

**Query Params:** `id` (integer, required)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Calendar ID 1 deleted successfully!"
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| `400` | `"Calendar ID is required in query parameters"` |
| `404` | `"Calendar not found"` |

---

### Galleries

#### `GET /api/admin/galleries`

Returns all gallery images.

**Auth:** Required

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "galleries": [
    {
      "id": 2,
      "title": "Sports Day 2026",
      "description": "Annual sports event highlights",
      "image_path": "uploads/galleries/1699789200000-sports.jpg",
      "created_at": "2026-11-05T14:00:00.000Z",
      "updated_at": "2026-11-05T14:00:00.000Z"
    }
  ]
}
```

---

#### `POST /api/admin/galleries`

Uploads a new gallery image or media file. Accepts any field name (`file`, `image`, `images`, `photo`, etc.) and any image/file type (JPEG, PNG, GIF, WebP, etc., max 30 MB). Uses `multipart/form-data`.

**Auth:** Required

**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Image title |
| `description` | string | No | Optional description |
| `file` (or `image`) | file | Yes | Image file (JPEG/PNG/GIF/WebP, max 30 MB; field key can be `file` or `image`) |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Gallery image uploaded successfully!",
  "gallery": {
    "id": 1,
    "title": "Academic Calendar 2026-27",
    "description": "Full academic year schedule",
    "image_path": "/uploads/galleries/gallery-1699789200000-123456789.jpg"
  }
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| `400` | `"Title and an image file are required via form-data"` |
| `400` | `"Image size must be below 30 MB. Please select a smaller image."` |
| `400` | `"Invalid file content: Uploaded file is not a valid image."` |

---

#### `PUT /api/admin/galleries?id=:id`

Updates the title or description of a gallery item (does not replace the image file).

**Auth:** Required

**Query Params:** `id` (integer, required)

**Request Body:**
```json
{
  "title": "Updated Gallery Title",
  "description": "Updated description"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Gallery ID 1 updated successfully!",
  "gallery": {
    "id": 1,
    "title": "Updated Gallery Title",
    "description": "Updated description",
    "image_path": "uploads/galleries/1699789200000-sports.jpg",
    "created_at": "2026-11-05T14:00:00.000Z",
    "updated_at": "2026-11-12T10:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| `400` | `"Gallery ID is required in query parameters"` |
| `404` | `"Gallery item not found"` |

---

#### `DELETE /api/admin/galleries?id=:id`

Deletes a gallery entry and its associated image file.

**Auth:** Required

**Query Params:** `id` (integer, required)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Gallery ID 1 deleted successfully!"
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| `400` | `"Gallery ID is required in query parameters"` |
| `404` | `"Gallery item not found"` |

---

### Thirukkural

#### `GET /api/admin/thirukkural`

Returns all Thirukkural entries.

**Auth:** Required

**Success Response (200):**
```json
{
  "success": true,
  "count": 1,
  "kurals": [
    {
      "id": 1,
      "kural_number": 1,
      "tamil_text": "அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு.",
      "english_meaning": "As the letter A is the first of all letters, so the eternal God is first in the world.",
      "explanation": "Just as 'A' begins the alphabet, God is the source and origin of the cosmos.",
      "created_at": "2026-09-01T09:00:00.000Z",
      "updated_at": "2026-09-01T09:00:00.000Z"
    }
  ]
}
```

---

#### `POST /api/admin/thirukkural`

Creates a new Thirukkural entry.

**Auth:** Required

**Request Body:**
```json
{
  "kural_number": 1,
  "tamil_text": "அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு.",
  "english_meaning": "As the letter A is the first of all letters, so the eternal God is first in the world.",
  "explanation": "Just as 'A' begins the alphabet, God is the source and origin of the cosmos."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Kural created successfully!",
  "kural": {
    "id": 1,
    "kural_number": 1,
    "tamil_text": "அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு.",
    "english_meaning": "As the letter A is the first of all letters, so the eternal God is first in the world.",
    "explanation": "Just as 'A' begins the alphabet, God is the source and origin of the cosmos."
  }
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| `400` | `"kural_number, tamil_text, and english_meaning are required"` |
| `400` | `"Kural number 1 already exists"` |

---

#### `PUT /api/admin/thirukkural?id=:id`

Updates an existing Thirukkural entry.

**Auth:** Required

**Query Params:** `id` (integer, required)

**Request Body:** *(all fields optional)*
```json
{
  "explanation": "Updated explanation text."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Kural ID 1 updated successfully!",
  "kural": {
    "id": 1,
    "kural_number": 1,
    "tamil_text": "அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு.",
    "english_meaning": "As the letter A is the first of all letters, so the eternal God is first in the world.",
    "explanation": "Updated explanation text."
  }
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| `400` | `"Kural ID is required in query parameters"` |
| `404` | `"Kural not found"` |

---

#### `DELETE /api/admin/thirukkural?id=:id`

Deletes a Thirukkural entry.

**Auth:** Required

**Query Params:** `id` (integer, required)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Kural ID 1 deleted successfully!"
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| `400` | `"Kural ID is required in query parameters"` |
| `404` | `"Kural not found"` |

---

### Admin Profile

> **Note:** The admin profile data is stored directly in the `admins` table. There is no separate profile table. The profile endpoints read and write columns on the admin's own account row.

#### `GET /api/admin/profile`

Returns the logged-in admin's profile data.

**Auth:** Required

**Success Response (200):**
```json
{
  "success": true,
  "profile": {
    "id": 1,
    "email": "admin@britoschool.com",
    "mobile_number": "9876543210",
    "full_name": "School Administrator",
    "alternative_email": "altadmin@britoschool.com",
    "phone_primary": "9876543210",
    "phone_secondary": "9876543211",
    "School_location": "Chennai, Tamil Nadu",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-11-12T10:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| `401` | `"Unauthorized: No token provided"` |
| `404` | `"Admin not found"` |

---

#### `POST /api/admin/profile`

Upsert-style update — sets profile fields on the admin's account. Requires `full_name` and `alternative_email`.

**Auth:** Required

**Request Body:**
```json
{
  "full_name": "School Administrator",
  "alternative_email": "altadmin@britoschool.com",
  "phone_primary": "9876543210",
  "phone_secondary": "9876543211",
  "School_location": "Chennai, Tamil Nadu"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Admin profile updated successfully!",
  "profile": {
    "id": 1,
    "email": "admin@britoschool.com",
    "mobile_number": "9876543210",
    "full_name": "School Administrator",
    "alternative_email": "altadmin@britoschool.com",
    "phone_primary": "9876543210",
    "phone_secondary": "9876543211",
    "School_location": "Chennai, Tamil Nadu",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-11-12T10:05:00.000Z"
  }
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| `400` | `"full_name and alternative_email are required fields"` |
| `401` | `"Unauthorized: No token provided"` |
| `404` | `"Admin not found"` |

---

#### `PUT /api/admin/profile`

Partially updates profile data. Only the fields sent in the body are changed; omitted fields retain their current values.

**Auth:** Required

**Request Body:** *(all fields optional)*
```json
{
  "full_name": "Updated Admin Name",
  "School_location": "Coimbatore, Tamil Nadu"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Admin profile updated successfully!",
  "profile": {
    "id": 1,
    "email": "admin@britoschool.com",
    "mobile_number": "9876543210",
    "full_name": "Updated Admin Name",
    "alternative_email": "altadmin@britoschool.com",
    "phone_primary": "9876543210",
    "phone_secondary": "9876543211",
    "School_location": "Coimbatore, Tamil Nadu",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-11-12T10:10:00.000Z"
  }
}
```

---

### Static Files

Uploaded files are served as static assets from the `/uploads` directory.

#### `GET /uploads/calendars/:filename`

Serves a calendar PDF file.

**Example:** `GET /uploads/calendars/1699789200000-calendar.pdf`

#### `GET /uploads/galleries/:filename`

Serves a gallery image file.

**Example:** `GET /uploads/galleries/1699789200000-sports.jpg`

---

## 8. Postman Testing Guide

### Phase 1: Setup

1. Download and install [Postman](https://www.postman.com/downloads/)
2. Import the collection from [Section 10](#10-postman-collection-json) or the file `server/docs/brito_school_postman_collection.json`
3. Set the `base_url` variable to `http://localhost:5000`
4. Start the server: `npm start` from the `server/` directory

### Phase 2: Login & Token

1. Run `POST /api/admin/login` with credentials:
   - Email: `admin@britoschool.com`
   - Password: `admin@123`
2. The pre-request script auto-saves the token to the `admin_token` variable
3. All subsequent requests use `{{admin_token}}` automatically

### Phase 3: Dashboard

1. Run `GET /api/admin/dashboard`
2. Verify the response contains `announcements`, `calendars`, `galleries`, `thirukkural`, and `generatedAt`
3. All `total` fields should be numbers (may be 0 on fresh install)

### Phase 4: Features Walkthrough

**Announcements:**
1. `POST /api/admin/announcements` — create with title, content, category
2. `GET /api/admin/announcements` — verify it appears in list
3. `PUT /api/admin/announcements?id=<id>` — update title
4. `DELETE /api/admin/announcements?id=<id>` — delete it

**Calendars:**
1. `POST /api/admin/calendars` — upload a real PDF file (use form-data, field name: `file`)
2. `GET /api/admin/calendars` — verify file_url is present
3. Visit `http://localhost:5000<file_url>` in browser to verify PDF is accessible
4. `DELETE /api/admin/calendars?id=<id>` — delete it

**Galleries:**
1. `POST /api/admin/galleries` — upload a JPEG/PNG image (form-data, field name: `image`)
2. `GET /api/admin/galleries` — verify upload worked
3. `PUT /api/admin/galleries?id=<id>` — update description
4. `DELETE /api/admin/galleries?id=<id>` — delete it

**Thirukkural:**
1. `POST /api/admin/thirukkural` — create with kural_number, tamil_text, english_meaning
2. `GET /api/admin/thirukkural` — verify list
3. `PUT /api/admin/thirukkural?id=<id>` — update explanation
4. `DELETE /api/admin/thirukkural?id=<id>` — delete it

**Admin Profile:**
1. `GET /api/admin/profile` — view current profile
2. `POST /api/admin/profile` — set full_name and alternative_email
3. `PUT /api/admin/profile` — partial update (e.g., School_location only)
4. `GET /api/admin/profile` — verify changes persisted

### Phase 5: Negative Tests

| Test | Expected |
|------|----------|
| `GET /api/admin/announcements` without token | `401` |
| `GET /api/admin/announcements` with `Bearer invalid_token` | `401` |
| `POST /api/admin/login` with wrong password | `401` |
| `POST /api/admin/announcements` without `content` | `400` |
| `PUT /api/admin/announcements?id=999999` | `404` |
| `DELETE /api/admin/calendars` (no id) | `400` |
| `POST /api/admin/thirukkural` with duplicate `kural_number` | `400` |
| `GET /api/admin/non-existent-route` | `404` |

### Phase 6: End-to-End

1. Login → get token → run dashboard → create an announcement → verify it shows in dashboard total → delete it → verify dashboard total decrements

---

## 9. Database Schema

### `admins`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INT, PK, AUTO_INCREMENT | |
| `email` | VARCHAR(255), UNIQUE | Login email |
| `password` | VARCHAR(255) | Bcrypt hashed |
| `mobile_number` | VARCHAR(20) | |
| `full_name` | VARCHAR(255), NULL | Profile field |
| `alternative_email` | VARCHAR(255), NULL | Profile field |
| `phone_primary` | VARCHAR(20), NULL | Profile field |
| `phone_secondary` | VARCHAR(20), NULL | Profile field |
| `School_location` | VARCHAR(255), NULL | Profile field |
| `otp_code` | VARCHAR(10), NULL | For password reset |
| `otp_expires_at` | DATETIME, NULL | OTP expiry |
| `created_at` | DATETIME | Auto set |
| `updated_at` | DATETIME | Auto updated |

### `announcements`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INT, PK, AUTO_INCREMENT | |
| `title` | VARCHAR(255) | |
| `content` | TEXT | |
| `category` | VARCHAR(100) | Default: "General" |
| `created_at` | DATETIME | |
| `updated_at` | DATETIME | |

### `calendars`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INT, PK, AUTO_INCREMENT | |
| `title` | VARCHAR(255) | |
| `description` | TEXT, NULL | |
| `file_path` | VARCHAR(500) | Relative path on disk |
| `file_url` | VARCHAR(500) | Served URL path |
| `created_at` | DATETIME | |
| `updated_at` | DATETIME | |

### `galleries`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INT, PK, AUTO_INCREMENT | |
| `title` | VARCHAR(255) | |
| `description` | TEXT, NULL | |
| `image_path` | VARCHAR(500) | Relative path on disk |
| `created_at` | DATETIME | |
| `updated_at` | DATETIME | |

### `thirukkural`
| Column | Type | Notes |
|--------|------|-------|
| `id` | INT, PK, AUTO_INCREMENT | |
| `kural_number` | INT, UNIQUE | 1–1330 |
| `tamil_text` | TEXT | Tamil verse |
| `english_meaning` | TEXT | Translation |
| `explanation` | TEXT, NULL | Commentary |
| `created_at` | DATETIME | |
| `updated_at` | DATETIME | |

---

## 10. Postman Collection JSON

Copy the JSON below and save as a `.json` file, then import into Postman via **File → Import**.

> Alternatively, import the ready-made collection file from `server/docs/brito_school_postman_collection.json`.

```json
{
  "info": {
    "name": "Brito School Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    { "key": "base_url", "value": "http://localhost:5000" },
    { "key": "admin_token", "value": "" }
  ],
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Login",
          "event": [{ "listen": "test", "script": { "exec": ["if (pm.response.code === 200) { pm.collectionVariables.set('admin_token', pm.response.json().token); }"], "type": "text/javascript" } }],
          "request": { "method": "POST", "url": "{{base_url}}/api/admin/login", "header": [{ "key": "Content-Type", "value": "application/json" }], "body": { "mode": "raw", "raw": "{\"email\": \"admin@britoschool.com\", \"password\": \"admin@123\"}" } }
        }
      ]
    },
    {
      "name": "Dashboard",
      "item": [
        {
          "name": "Get Dashboard",
          "request": { "method": "GET", "url": "{{base_url}}/api/admin/dashboard", "header": [{ "key": "Authorization", "value": "Bearer {{admin_token}}" }] }
        }
      ]
    },
    {
      "name": "Announcements",
      "item": [
        { "name": "List Announcements", "request": { "method": "GET", "url": "{{base_url}}/api/admin/announcements", "header": [{ "key": "Authorization", "value": "Bearer {{admin_token}}" }] } },
        { "name": "Create Announcement", "request": { "method": "POST", "url": "{{base_url}}/api/admin/announcements", "header": [{ "key": "Authorization", "value": "Bearer {{admin_token}}" }, { "key": "Content-Type", "value": "application/json" }], "body": { "mode": "raw", "raw": "{\"title\": \"School Event\", \"content\": \"Annual Day on Nov 20\", \"category\": \"Events\"}" } } },
        { "name": "Update Announcement", "request": { "method": "PUT", "url": { "raw": "{{base_url}}/api/admin/announcements?id=1", "host": ["{{base_url}}"], "path": ["api", "admin", "announcements"], "query": [{ "key": "id", "value": "1" }] }, "header": [{ "key": "Authorization", "value": "Bearer {{admin_token}}" }, { "key": "Content-Type", "value": "application/json" }], "body": { "mode": "raw", "raw": "{\"title\": \"Updated Event\"}" } } },
        { "name": "Delete Announcement", "request": { "method": "DELETE", "url": { "raw": "{{base_url}}/api/admin/announcements?id=1", "host": ["{{base_url}}"], "path": ["api", "admin", "announcements"], "query": [{ "key": "id", "value": "1" }] }, "header": [{ "key": "Authorization", "value": "Bearer {{admin_token}}" }] } }
      ]
    },
    {
      "name": "Admin Profile",
      "item": [
        { "name": "Get Profile", "request": { "method": "GET", "url": "{{base_url}}/api/admin/profile", "header": [{ "key": "Authorization", "value": "Bearer {{admin_token}}" }] } },
        { "name": "Set Profile", "request": { "method": "POST", "url": "{{base_url}}/api/admin/profile", "header": [{ "key": "Authorization", "value": "Bearer {{admin_token}}" }, { "key": "Content-Type", "value": "application/json" }], "body": { "mode": "raw", "raw": "{\"full_name\": \"School Admin\", \"alternative_email\": \"alt@britoschool.com\", \"School_location\": \"Chennai\"}" } } },
        { "name": "Update Profile", "request": { "method": "PUT", "url": "{{base_url}}/api/admin/profile", "header": [{ "key": "Authorization", "value": "Bearer {{admin_token}}" }, { "key": "Content-Type", "value": "application/json" }], "body": { "mode": "raw", "raw": "{\"School_location\": \"Coimbatore\"}" } } }
      ]
    }
  ]
}
```
