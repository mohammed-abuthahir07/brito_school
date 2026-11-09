# Complete Backend API Documentation

This document provides exhaustive, production-grade technical documentation for every API endpoint available in the Brito School Backend.

---

## 0. System Health Check

### 0.1 Health Check (Liveness & Readiness)
- **Name:** Health Check
- **Purpose:** Probe application uptime, MySQL connectivity status, query ping latency, and memory consumption metrics for container orchestrators (Docker, Kubernetes) and load balancers.
- **Method:** `GET`
- **URL:** `/health`
- **Authentication:** None (Public)
- **Rate Limit:** Unrestricted
- **Example Request:**
  ```http
  GET /health HTTP/1.1
  Host: localhost:5000
  ```
- **Example Success Response (`200 OK`):**
  ```json
  {
    "status": "UP",
    "timestamp": "2026-11-09T10:45:00.000Z",
    "uptimeSeconds": 1420,
    "database": {
      "status": "CONNECTED",
      "latencyMs": 0.85
    },
    "memory": {
      "rssMb": 42.15,
      "heapUsedMb": 24.32,
      "heapTotalMb": 38.50
    }
  }
  ```
- **Error Response (`503 Service Unavailable`):**
  Returned if the MySQL connection pool fails to respond to `SELECT 1 AS ping`.
- **Database Tables:** None (`SELECT 1 AS ping`)

---

## 1. Authentication Endpoints

### 1.1 Admin Login
- **Name:** Admin Login
- **Purpose:** Authenticate administrator credentials, issue a JSON Web Token (JWT) valid for 24 hours, and return basic administrator details.
- **Method:** `POST`
- **URL:** `/api/admin/login`
- **Authentication:** None (Public)
- **Rate Limit:** 30 requests per 15 minutes
- **Headers:** `Content-Type: application/json`
- **Path Parameters:** None
- **Query Parameters:** None
- **Request Body:**
  | Field | Type | Required | Description |
  | :--- | :--- | :---: | :--- |
  | `email` | `string` | Yes | Registered admin email address |
  | `password` | `string` | Yes | Admin password |
- **Validation Rules:**
  - `email` and `password` must not be empty.
  - Email lookup in `admins` table.
  - Password must match `bcrypt` hash.
- **Example Request:**
  ```http
  POST /api/admin/login HTTP/1.1
  Host: localhost:5000
  Content-Type: application/json

  {
    "email": "admin@britoschool.com",
    "password": "secureAdminPassword123"
  }
  ```
- **Example Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Admin logged in successfully!",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": 1,
      "email": "admin@britoschool.com",
      "mobile_number": "9876543210"
    }
  }
  ```
- **Example Error Responses:**
  - `400 Bad Request` (Missing fields):
    ```json
    {
      "success": false,
      "message": "Email and password are required"
    }
    ```
  - `401 Unauthorized` (Invalid credentials):
    ```json
    {
      "success": false,
      "message": "Invalid email or password"
    }
    ```
- **Database Tables:** `admins` (`SELECT`)
- **Business Rules:** JWT contains `{ id, email }` payload with 1-day expiration.

---

### 1.2 Forgot Password (Send OTP)
- **Name:** Forgot Password
- **Purpose:** Generate a temporary 6-digit OTP code, persist it in the database with a 2-minute expiration, and dispatch it to the admin's email via Nodemailer.
- **Method:** `POST`
- **URL:** `/api/admin/forgot-password`
- **Authentication:** None (Public)
- **Rate Limit:** 30 requests per 15 minutes
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  | Field | Type | Required | Description |
  | :--- | :--- | :---: | :--- |
  | `email` | `string` | Yes | Registered admin email address |
- **Example Request:**
  ```json
  {
    "email": "admin@britoschool.com"
  }
  ```
- **Example Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "OTP sent successfully to your email. Valid for 2 minutes."
  }
  ```
- **Example Error Responses:**
  - `400 Bad Request`:
    ```json
    {
      "success": false,
      "message": "Email address is required"
    }
    ```
  - `404 Not Found`:
    ```json
    {
      "success": false,
      "message": "Admin account not found with this email"
    }
    ```
  - `500 Internal Server Error`:
    ```json
    {
      "success": false,
      "message": "Failed to send OTP email",
      "error": "Connection timeout"
    }
    ```
- **Database Tables:** `admins` (`SELECT`, `UPDATE`)
- **Business Rules:** OTP is a 6-digit numeric string between `100000` and `999999`. Expiry timestamp is set to `DATE_ADD(NOW(), INTERVAL 2 MINUTE)`.

---

### 1.3 Reset Password (Verify OTP & Change Password)
- **Name:** Reset Password
- **Purpose:** Verify the OTP code against `admins.otp_code` and check expiration, hash the new password using `bcrypt`, update the database, and clear OTP fields.
- **Method:** `POST`
- **URL:** `/api/admin/reset-password`
- **Authentication:** None (Public)
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  | Field | Type | Required | Description |
  | :--- | :--- | :---: | :--- |
  | `email` | `string` | Yes | Registered admin email |
  | `otp` | `string` | Yes | 6-digit OTP code received via email |
  | `newPassword` | `string` | Yes | New password (minimum 6 characters) |
  | `confirmPassword` | `string` | Yes | Must match `newPassword` exactly |
- **Validation Rules:**
  - All four fields are strictly required.
  - `newPassword === confirmPassword`.
  - `newPassword.length >= 6`.
  - Admin record must exist.
  - `otp` must match `admin.otp_code`.
  - `new Date() <= new Date(admin.otp_expires_at)`.
- **Example Request:**
  ```json
  {
    "email": "admin@britoschool.com",
    "otp": "482915",
    "newPassword": "brandNewSecurePassword2026",
    "confirmPassword": "brandNewSecurePassword2026"
  }
  ```
- **Example Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Password reset successful! You can now log in."
  }
  ```
- **Example Error Responses:**
  - `400 Bad Request` (Mismatch):
    ```json
    {
      "success": false,
      "message": "New password and confirm password do not match"
    }
    ```
  - `400 Bad Request` (Expired OTP):
    ```json
    {
      "success": false,
      "message": "OTP has expired! Please request a new one."
    }
    ```
  - `400 Bad Request` (Invalid OTP):
    ```json
    {
      "success": false,
      "message": "Invalid OTP code."
    }
    ```
- **Database Tables:** `admins` (`SELECT`, `UPDATE`)

---

## 2. Announcements Endpoints

### 2.1 List All Announcements
- **Name:** List Announcements
- **Purpose:** Retrieve all announcements sorted chronologically from newest to oldest.
- **Method:** `GET`
- **URL:** `/api/admin/announcements`
- **Authentication:** Bearer Token required
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Example Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "count": 2,
    "announcements": [
      {
        "id": 2,
        "title": "Annual Sports Day 2026",
        "content": "Sports day events will commence from next Monday.",
        "category": "Events",
        "created_at": "2026-11-09T10:00:00.000Z",
        "updated_at": "2026-11-09T10:00:00.000Z"
      },
      {
        "id": 1,
        "title": "School Reopening Schedule",
        "content": "Classes for term 2 commence on schedule.",
        "category": "General",
        "created_at": "2026-11-01T08:30:00.000Z",
        "updated_at": "2026-11-01T08:30:00.000Z"
      }
    ]
  }
  ```
- **Database Tables:** `announcements` (`SELECT ... ORDER BY created_at DESC`)
- **Optimization:** Utilizes index `idx_announcements_created_at` avoiding filesort.

---

### 2.2 Create Announcement
- **Name:** Create Announcement
- **Method:** `POST`
- **URL:** `/api/admin/announcements`
- **Authentication:** Bearer Token required
- **Headers:** `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`
- **Request Body:**
  | Field | Type | Required | Default | Description |
  | :--- | :--- | :---: | :--- | :--- |
  | `title` | `string` | Yes | - | Announcement headline |
  | `content` | `string` | Yes | - | Detailed message |
  | `category` | `string` | No | `'General'` | Category tag |
- **Example Request:**
  ```json
  {
    "title": "Science Exhibition 2026",
    "content": "All students from grades 6-12 must register projects.",
    "category": "Academic"
  }
  ```
- **Example Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Announcement created successfully!",
    "announcement": {
      "id": 3,
      "title": "Science Exhibition 2026",
      "content": "All students from grades 6-12 must register projects.",
      "category": "Academic",
      "created_at": "2026-11-09T10:35:00.000Z",
      "updated_at": "2026-11-09T10:35:00.000Z"
    }
  }
  ```
- **Database Tables:** `announcements` (`INSERT`, `SELECT`)

---

### 2.3 Edit Announcement
- **Name:** Edit Announcement
- **Method:** `PUT`
- **URL:** `/api/admin/announcements?id=:id`
- **Authentication:** Bearer Token required
- **Query Parameters:**
  | Parameter | Type | Required | Description |
  | :--- | :--- | :---: | :--- |
  | `id` | `integer` | Yes | ID of announcement to update |
- **Request Body:**
  | Field | Type | Required | Description |
  | :--- | :--- | :---: | :--- |
  | `title` | `string` | No | New title (preserves existing if omitted) |
  | `content` | `string` | No | New content (preserves existing if omitted) |
  | `category` | `string` | No | New category (preserves existing if omitted) |
- **Example Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Announcement ID 3 updated successfully!",
    "announcement": {
      "id": 3,
      "title": "Science Exhibition 2026 - Updated Venue",
      "content": "Exhibition will now take place in the Main Auditorium.",
      "category": "Academic",
      "created_at": "2026-11-09T10:35:00.000Z",
      "updated_at": "2026-11-09T10:40:00.000Z"
    }
  }
  ```
- **Error Codes:** `400` if `id` parameter missing; `404` if announcement does not exist.
- **Database Tables:** `announcements` (`SELECT`, `UPDATE`)

---

### 2.4 Delete Announcement
- **Name:** Delete Announcement
- **Method:** `DELETE`
- **URL:** `/api/admin/announcements?id=:id`
- **Authentication:** Bearer Token required
- **Query Parameters:** `id` (`integer`, required)
- **Example Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Announcement ID 3 deleted successfully!"
  }
  ```
- **Error Codes:** `400` if `id` missing or announcement not found.
- **Database Tables:** `announcements` (`SELECT`, `DELETE`)

---

## 3. Academic Calendars Endpoints

### 3.1 List All Calendars
- **Name:** List Calendars
- **Method:** `GET`
- **URL:** `/api/admin/calendars`
- **Authentication:** Bearer Token required
- **Example Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "count": 1,
    "calendars": [
      {
        "id": 1,
        "title": "Academic Calendar 2026-2027",
        "description": "Annual academic schedule and examination milestones",
        "file_path": "/uploads/calendars/calendar-1794211361137-254226641.pdf",
        "file_url": "/uploads/calendars/calendar-1794211361137-254226641.pdf",
        "created_at": "2026-11-09T08:02:41.000Z",
        "updated_at": "2026-11-09T08:02:41.000Z"
      }
    ]
  }
  ```
- **Database Tables:** `calendars` (`SELECT ... ORDER BY created_at DESC`)
- **Optimization:** Indexed via `idx_calendars_created_at`.

---

### 3.2 Upload Calendar PDF
- **Name:** Upload Calendar
- **Method:** `POST`
- **URL:** `/api/admin/calendars`
- **Authentication:** Bearer Token required
- **Content-Type:** `multipart/form-data`
- **Form-Data Fields:**
  | Field | Type | Required | Constraints |
  | :--- | :--- | :---: | :--- |
  | `title` | `text` | Yes | Calendar title |
  | `description` | `text` | No | Optional description |
  | `file` | `file` | Yes | PDF only (`application/pdf`), max 10MB |
- **Example Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Calendar PDF uploaded successfully!",
    "calendar": {
      "id": 2,
      "title": "Primary Section Exam Calendar",
      "description": "Mid-term test dates",
      "file_path": "/uploads/calendars/calendar-1794211459271-767900982.pdf",
      "file_url": "/uploads/calendars/calendar-1794211459271-767900982.pdf",
      "created_at": "2026-11-09T10:45:00.000Z",
      "updated_at": "2026-11-09T10:45:00.000Z"
    }
  }
  ```
- **Error Responses:** `400 Bad Request` if file is not PDF or size exceeds 10MB.
- **Database Tables:** `calendars` (`INSERT`, `SELECT`)

---

### 3.3 Delete Calendar Record
- **Name:** Delete Calendar
- **Method:** `DELETE`
- **URL:** `/api/admin/calendars?id=:id`
- **Authentication:** Bearer Token required
- **Query Parameters:** `id` (`integer`, required)
- **Example Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Calendar ID 2 deleted successfully!"
  }
  ```
- **Behavior:** Unlinks physical PDF from disk asynchronously without blocking the event loop, then deletes database row.
- **Error Codes:** `400` if `id` missing; `404` if calendar not found.
- **Database Tables:** `calendars` (`SELECT`, `DELETE`)

---

## 4. Galleries Endpoints

### 4.1 List All Galleries
- **Name:** List Galleries
- **Method:** `GET`
- **URL:** `/api/admin/galleries`
- **Authentication:** Bearer Token required
- **Example Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "count": 1,
    "galleries": [
      {
        "id": 1,
        "title": "Independence Day Celebrations",
        "description": "Flag hoisting ceremony and student cultural events",
        "image_path": "/uploads/galleries/gallery-1794211234567-891011121.jpg",
        "created_at": "2026-11-09T08:00:00.000Z",
        "updated_at": "2026-11-09T08:00:00.000Z"
      }
    ]
  }
  ```
- **Optimization:** Indexed via `idx_galleries_created_at`.

---

### 4.2 Upload Gallery Image
- **Name:** Add Gallery Image
- **Method:** `POST`
- **URL:** `/api/admin/galleries`
- **Authentication:** Bearer Token required
- **Content-Type:** `multipart/form-data`
- **Form-Data Fields:**
  | Field | Type | Required | Constraints |
  | :--- | :--- | :---: | :--- |
  | `title` | `text` | Yes | Gallery photo title |
  | `description` | `text` | No | Photo description |
  | `image` | `file` | Yes | Image file (`image/*`), max 5MB |
- **Example Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Gallery image uploaded successfully!",
    "gallery": {
      "id": 2,
      "title": "Science Lab Inauguration",
      "description": "Opening of state-of-the-art robotics wing",
      "image_path": "/uploads/galleries/gallery-1794212987654-123456789.png",
      "created_at": "2026-11-09T10:50:00.000Z",
      "updated_at": "2026-11-09T10:50:00.000Z"
    }
  }
  ```

---

### 4.3 Edit Gallery Item
- **Name:** Edit Gallery Item
- **Method:** `PUT`
- **URL:** `/api/admin/galleries?id=:id`
- **Authentication:** Bearer Token required
- **Content-Type:** `multipart/form-data`
- **Query Parameters:** `id` (`integer`, required)
- **Form-Data Fields:**
  | Field | Type | Required | Description |
  | :--- | :--- | :---: | :--- |
  | `title` | `text` | No | Updated title |
  | `description` | `text` | No | Updated description |
  | `image` | `file` | No | Optional replacement image |
- **Behavior:** If a new image is provided, the previous physical image file is asynchronously unlinked from disk.
- **Example Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Gallery ID 2 updated successfully!",
    "gallery": {
      "id": 2,
      "title": "Science Lab Inauguration - Revised",
      "description": "Updated description",
      "image_path": "/uploads/galleries/gallery-1794213000000-987654321.png",
      "created_at": "2026-11-09T10:50:00.000Z",
      "updated_at": "2026-11-09T10:55:00.000Z"
    }
  }
  ```

---

### 4.4 Delete Gallery Item
- **Name:** Delete Gallery Item
- **Method:** `DELETE`
- **URL:** `/api/admin/galleries?id=:id`
- **Authentication:** Bearer Token required
- **Query Parameters:** `id` (`integer`, required)
- **Example Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Gallery ID 2 deleted successfully!"
  }
  ```

---

## 5. Thirukkural Endpoints

### 5.1 List All Kurals
- **Name:** List Thirukkural Verses
- **Method:** `GET`
- **URL:** `/api/admin/thirukkural`
- **Authentication:** Bearer Token required
- **Example Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "count": 1,
    "kurals": [
      {
        "id": 1,
        "kural_number": 1,
        "tamil_text": "அகர முதல எழுத்தெல்லாம் ஆதி\nபகவன் முதற்றே உலகு.",
        "english_meaning": "As the letter A is the first of all letters, so the eternal God is first in the world.",
        "explanation": "As the letter 'A' is the beginning of the alphabet, so the primordial God is the beginning of the universe.",
        "created_at": "2026-11-09T07:45:00.000Z",
        "updated_at": "2026-11-09T07:45:00.000Z"
      }
    ]
  }
  ```
- **Sorting:** Sorted ascending by `kural_number ASC`.

---

### 5.2 Add New Kural
- **Name:** Add Kural
- **Method:** `POST`
- **URL:** `/api/admin/thirukkural`
- **Authentication:** Bearer Token required
- **Request Body:**
  | Field | Type | Required | Description |
  | :--- | :--- | :---: | :--- |
  | `kural_number` | `integer` | Yes | Unique verse number (1 to 1330) |
  | `tamil_text` | `string` | Yes | Tamil couplet |
  | `english_meaning` | `string` | Yes | English translation |
  | `explanation` | `string` | No | Philosophical or literary explanation |
- **Validation Rules:**
  - `kural_number`, `tamil_text`, `english_meaning` must be present.
  - `kural_number` must be unique; fails with `400` if already registered.
- **Example Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Thirukkural added successfully!",
    "kural": {
      "id": 2,
      "kural_number": 2,
      "tamil_text": "கற்றதனா லாய பயனென்கொல் வாலறிவன்\nநற்றாள் தொழாஅர் எனின்.",
      "english_meaning": "What does learning profit a man, if he doesn't worship the sacred feet of Him who is pure intelligence?",
      "explanation": "True wisdom finds its completion in revering the divine.",
      "created_at": "2026-11-09T11:00:00.000Z",
      "updated_at": "2026-11-09T11:00:00.000Z"
    }
  }
  ```

---

### 5.3 Edit Kural
- **Name:** Edit Kural
- **Method:** `PUT`
- **URL:** `/api/admin/thirukkural?id=:id`
- **Authentication:** Bearer Token required
- **Query Parameters:** `id` (`integer`, required)
- **Request Body:** Partial or complete updates to `kural_number`, `tamil_text`, `english_meaning`, `explanation`.
- **Example Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Thirukkural ID 2 updated successfully!",
    "kural": {
      "id": 2,
      "kural_number": 2,
      "tamil_text": "கற்றதனா லாய பயனென்கொல் வாலறிவன்\nநற்றாள் தொழாஅர் எனின்.",
      "english_meaning": "What fruit from all your knowledge will you gain, if you adore not His auspicious feet?",
      "explanation": "Revised explanation.",
      "created_at": "2026-11-09T11:00:00.000Z",
      "updated_at": "2026-11-09T11:05:00.000Z"
    }
  }
  ```

---

### 5.4 Delete Kural
- **Name:** Delete Kural
- **Method:** `DELETE`
- **URL:** `/api/admin/thirukkural?id=:id`
- **Authentication:** Bearer Token required
- **Query Parameters:** `id` (`integer`, required)
- **Example Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Thirukkural ID 2 deleted successfully!"
  }
  ```

---

## 6. Admin Profile Endpoints

### 6.1 Get Admin Profile
- **Name:** Get Current Admin Profile
- **Method:** `GET`
- **URL:** `/api/admin/profile`
- **Authentication:** Bearer Token required
- **Description:** Looks up the profile matching the logged-in administrator (`req.admin.id`).
- **Example Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "profile": {
      "id": 1,
      "admin_id": 1,
      "full_name": "Headmaster Robert",
      "alternative_email": "headmaster@britoschool.com",
      "phone_primary": "+91 9876543210",
      "phone_secondary": "+91 9876543211",
      "School_location": "Main Campus, Chennai",
      "bio": "Serving as educational administrator for over 15 years.",
      "emergency_contact_phone": "+91 9876543299",
      "linkedin_url": "https://linkedin.com/in/brito-headmaster",
      "created_at": "2026-11-09T08:15:00.000Z",
      "updated_at": "2026-11-09T08:15:00.000Z"
    }
  }
  ```
- **Error Codes:** `404 Not Found` if profile has not been created yet.

---

### 6.2 Create Admin Profile
- **Name:** Create Profile
- **Method:** `POST`
- **URL:** `/api/admin/profile`
- **Authentication:** Bearer Token required
- **Request Body:**
  | Field | Type | Required | Description |
  | :--- | :--- | :---: | :--- |
  | `full_name` | `string` | Yes | Administrator's full name |
  | `alternative_email` | `string` | Yes | Secondary contact email |
  | `phone_primary` | `string` | No | Primary phone number |
  | `phone_secondary` | `string` | No | Secondary phone number |
  | `School_location` | `string` | No | School campus or branch |
  | `bio` | `string` | No | Biographical summary |
  | `emergency_contact_phone` | `string` | No | Emergency phone contact |
  | `linkedin_url` | `string` | No | LinkedIn profile URL |
- **Validation Rules:**
  - `full_name` and `alternative_email` are strictly mandatory.
  - If a profile already exists for `admin_id`, returns `400 Bad Request` ("Profile already exists. Use PUT to update your details.").
- **Example Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Admin profile created successfully!",
    "profile": {
      "id": 1,
      "admin_id": 1,
      "full_name": "Headmaster Robert",
      "alternative_email": "headmaster@britoschool.com",
      "phone_primary": "+91 9876543210",
      "phone_secondary": null,
      "School_location": "Main Campus",
      "bio": null,
      "emergency_contact_phone": null,
      "linkedin_url": null,
      "created_at": "2026-11-09T11:15:00.000Z",
      "updated_at": "2026-11-09T11:15:00.000Z"
    }
  }
  ```

---

### 6.3 Update Admin Profile
- **Name:** Update Profile
- **Method:** `PUT`
- **URL:** `/api/admin/profile`
- **Authentication:** Bearer Token required
- **Request Body:** Any subset of profile fields (`full_name`, `alternative_email`, `phone_primary`, `phone_secondary`, `School_location`, `bio`, `emergency_contact_phone`, `linkedin_url`).
- **Behavior:** Merges received fields with existing database values; omitted fields retain their existing values.
- **Example Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Admin profile updated successfully!",
    "profile": {
      "id": 1,
      "admin_id": 1,
      "full_name": "Headmaster Robert",
      "alternative_email": "headmaster@britoschool.com",
      "phone_primary": "+91 9876543210",
      "phone_secondary": "+91 9876543211",
      "School_location": "Main Campus, Chennai",
      "bio": "Updated administrative vision.",
      "emergency_contact_phone": "+91 9876543299",
      "linkedin_url": "https://linkedin.com/in/brito-headmaster",
      "created_at": "2026-11-09T11:15:00.000Z",
      "updated_at": "2026-11-09T11:20:00.000Z"
    }
  }
  ```
- **Error Codes:** `404 Not Found` if no profile exists for current admin.

---

### 6.4 Delete Admin Profile
- **Name:** Delete Profile
- **Method:** `DELETE`
- **URL:** `/api/admin/profile`
- **Authentication:** Bearer Token required
- **Example Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Admin profile deleted successfully!"
  }
  ```
- **Error Codes:** `404 Not Found` if profile does not exist.
