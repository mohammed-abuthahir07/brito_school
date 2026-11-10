# Brito School Management — Complete Backend API Document

**Base URL:** `http://localhost:5000` (or production domain)  
**Standard Auth Header:** `Authorization: Bearer <JWT_TOKEN>`  
**Content-Type:** `application/json` (or `multipart/form-data` for file uploads)  

---

## Table of Contents
1. [System Health Check](#0-system-health-check)
2. [Authentication & Password Management](#1-authentication--password-management)
   - [1.1 Admin Login](#11-admin-login)
   - [1.2 Forgot Password (Send OTP)](#12-forgot-password-send-otp)
   - [1.3 Reset Password (Verify OTP)](#13-reset-password-verify-otp)
3. [Functionality 1: Announcements Management](#2-functionality-1-announcements-management)
   - [2.1 List All Announcements](#21-list-all-announcements)
   - [2.2 Create Announcement](#22-create-announcement)
   - [2.3 Edit Announcement](#23-edit-announcement)
   - [2.4 Delete Announcement](#24-delete-announcement)
4. [Functionality 2: Academic Calendars Management](#3-functionality-2-academic-calendars-management)
   - [3.1 List All Calendars](#31-list-all-calendars)
   - [3.2 Upload Calendar PDF](#32-upload-calendar-pdf)
   - [3.3 Delete Calendar](#33-delete-calendar)
5. [Functionality 3: Media Galleries Management](#4-functionality-3-media-galleries-management)
   - [4.1 List All Galleries](#41-list-all-galleries)
   - [4.2 Upload Gallery Image](#42-upload-gallery-image)
   - [4.3 Edit Gallery Item](#43-edit-gallery-item)
   - [4.4 Delete Gallery Item](#44-delete-gallery-item)
6. [Functionality 4: Thirukkural Couplets](#5-functionality-4-thirukkural-couplets)
   - [5.1 List All Thirukkural Verses](#51-list-all-thirukkural-verses)
   - [5.2 Add New Thirukkural Verse](#52-add-new-thirukkural-verse)
   - [5.3 Edit Thirukkural Verse](#53-edit-thirukkural-verse)
   - [5.4 Delete Thirukkural Verse](#54-delete-thirukkural-verse)
7. [Functionality 5: Admin Profile Management](#6-functionality-5-admin-profile-management)
   - [6.1 Get Admin Profile](#61-get-admin-profile)
   - [6.2 Create Admin Profile](#62-create-admin-profile)
   - [6.3 Update Admin Profile](#63-update-admin-profile)
   - [6.4 Delete Admin Profile](#64-delete-admin-profile)
8. [Static Upload File Serving](#7-static-upload-file-serving)

---

## 0. System Health Check

### 0.1 Health Check (Liveness & Readiness)
- **Method:** `GET`
- **URL:** `/health`
- **Authentication:** None (Public)
- **Description:** Returns server uptime, MySQL ping latency, connection pool state, and disk storage metrics.

#### Request Example
```http
GET /health HTTP/1.1
Host: localhost:5000
```

#### Success Response (`200 OK`)
```json
{
  "status": "UP",
  "timestamp": "2026-11-09T11:00:00.000Z",
  "uptimeSeconds": 1420,
  "database": {
    "status": "CONNECTED",
    "latencyMs": 0.85
  },
  "connectionPool": {
    "totalConnections": 3,
    "freeConnections": 3,
    "waitingRequests": 0
  },
  "storage": {
    "freeGb": 251.81,
    "totalGb": 474.53,
    "usagePercent": 46.9
  },
  "memory": {
    "rssMb": 42.15,
    "heapUsedMb": 24.32,
    "heapTotalMb": 38.50
  }
}
```

#### Error Response (`503 Service Unavailable`)
```json
{
  "status": "DEGRADED",
  "timestamp": "2026-11-09T11:00:00.000Z",
  "uptimeSeconds": 1420,
  "database": {
    "status": "UNREACHABLE",
    "latencyMs": null
  }
}
```

---

## 1. Authentication & Password Management

### 1.1 Admin Login
- **Method:** `POST`
- **URL:** `/api/admin/login`
- **Authentication:** None (Public)
- **Rate Limit:** 30 requests / 15 minutes
- **Headers:** `Content-Type: application/json`

#### Request Parameters (Body)
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `email` | `string` | Yes | Registered admin email address |
| `password` | `string` | Yes | Administrator password |

#### Request Example
```json
{
  "email": "admin@britoschool.com",
  "password": "Password1234"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Admin logged in successfully!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBicml0b3NjaG9vbC5jb20iLCJpYXQiOjE3OTQyMTYwMDAsImV4cCI6MTc5NDMwMjQwMH0.signature",
  "admin": {
    "id": 1,
    "email": "admin@britoschool.com",
    "mobile_number": "9876543210"
  }
}
```

#### Error Responses
- **`400 Bad Request`** (Missing fields):
  ```json
  {
    "success": false,
    "message": "Email and password are required"
  }
  ```
- **`401 Unauthorized`** (Invalid credentials / timing-safe):
  ```json
  {
    "success": false,
    "message": "Invalid email or password"
  }
  ```
- **`429 Too Many Requests`** (Rate limited):
  ```json
  {
    "success": false,
    "message": "Too many authentication attempts. Please try again later.",
    "retryAfterSeconds": 780
  }
  ```

---

### 1.2 Forgot Password (Send OTP)
- **Method:** `POST`
- **URL:** `/api/admin/forgot-password`
- **Authentication:** None (Public)
- **Rate Limit:** 30 requests / 15 minutes
- **Headers:** `Content-Type: application/json`

#### Request Parameters (Body)
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `email` | `string` | Yes | Registered admin email address |

#### Request Example
```json
{
  "email": "admin@britoschool.com"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "OTP sent successfully to your email. Valid for 2 minutes."
}
```

#### Error Responses
- **`400 Bad Request`** (Missing email):
  ```json
  {
    "success": false,
    "message": "Email address is required"
  }
  ```
- **`404 Not Found`** (Email not found):
  ```json
  {
    "success": false,
    "message": "Admin account not found with this email"
  }
  ```
- **`500 Internal Server Error`** (SMTP delivery failure):
  ```json
  {
    "success": false,
    "message": "Failed to send OTP email"
  }
  ```

---

### 1.3 Reset Password (Verify OTP)
- **Method:** `POST`
- **URL:** `/api/admin/reset-password`
- **Authentication:** None (Public)
- **Headers:** `Content-Type: application/json`

#### Request Parameters (Body)
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `email` | `string` | Yes | Registered admin email address |
| `otp` | `string` | Yes | 6-digit OTP code received in email |
| `newPassword` | `string` | Yes | New password (minimum 6 characters) |
| `confirmPassword` | `string` | Yes | Must match `newPassword` exactly |

#### Request Example
```json
{
  "email": "admin@britoschool.com",
  "otp": "492018",
  "newPassword": "brandNewSecurePassword2026",
  "confirmPassword": "brandNewSecurePassword2026"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Password reset successful! You can now log in."
}
```

#### Error Responses
- **`400 Bad Request`** (Missing fields):
  ```json
  {
    "success": false,
    "message": "All fields are required"
  }
  ```
- **`400 Bad Request`** (Passwords mismatch):
  ```json
  {
    "success": false,
    "message": "New password and confirm password do not match"
  }
  ```
- **`400 Bad Request`** (Password too short):
  ```json
  {
    "success": false,
    "message": "Password must be at least 6 characters long"
  }
  ```
- **`400 Bad Request`** (Invalid OTP code):
  ```json
  {
    "success": false,
    "message": "Invalid OTP code."
  }
  ```
- **`400 Bad Request`** (Expired OTP code > 2 minutes):
  ```json
  {
    "success": false,
    "message": "OTP has expired! Please request a new one."
  }
  ```
- **`404 Not Found`** (Admin account not found):
  ```json
  {
    "success": false,
    "message": "Admin account not found"
  }
  ```

---

## 2. Functionality 1: Announcements Management

### 2.1 List All Announcements
- **Method:** `GET`
- **URL:** `/api/admin/announcements`
- **Authentication:** Bearer Token required
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Sorting:** Newest to oldest (`created_at DESC`)

#### Request Example
```http
GET /api/admin/announcements HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "count": 2,
  "announcements": [
    {
      "id": 2,
      "title": "Annual Sports Day 2026",
      "content": "Competitions and track events commence from next Monday.",
      "category": "Events",
      "created_at": "2026-11-09T09:30:00.000Z",
      "updated_at": "2026-11-09T09:30:00.000Z"
    },
    {
      "id": 1,
      "title": "School Reopening Circular",
      "content": "Term 2 classes begin as per standard schedule.",
      "category": "General",
      "created_at": "2026-11-01T08:00:00.000Z",
      "updated_at": "2026-11-01T08:00:00.000Z"
    }
  ]
}
```

#### Error Responses
- **`401 Unauthorized`** (No token):
  ```json
  {
    "success": false,
    "message": "Unauthorized: No token provided"
  }
  ```
- **`401 Unauthorized`** (Invalid / Expired token):
  ```json
  {
    "success": false,
    "message": "Unauthorized: Invalid or expired token"
  }
  ```

---

### 2.2 Create Announcement
- **Method:** `POST`
- **URL:** `/api/admin/announcements`
- **Authentication:** Bearer Token required
- **Headers:** `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`

#### Request Parameters (Body)
| Field | Type | Required | Default | Description |
| :--- | :--- | :---: | :--- | :--- |
| `title` | `string` | Yes | - | Announcement headline |
| `content` | `string` | Yes | - | Full body text |
| `category` | `string` | No | `'General'` | Category tag (e.g., General, Events, Academic) |

#### Request Example
```json
{
  "title": "Science Exhibition 2026",
  "content": "All students from classes 6 to 12 must submit project proposals.",
  "category": "Academic"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Announcement created successfully!",
  "announcement": {
    "id": 3,
    "title": "Science Exhibition 2026",
    "content": "All students from classes 6 to 12 must submit project proposals.",
    "category": "Academic",
    "created_at": "2026-11-09T11:15:00.000Z",
    "updated_at": "2026-11-09T11:15:00.000Z"
  }
}
```

#### Error Response (`400 Bad Request`)
```json
{
  "success": false,
  "message": "Title and content are required"
}
```

---

### 2.3 Edit Announcement
- **Method:** `PUT`
- **URL:** `/api/admin/announcements?id=:id`
- **Authentication:** Bearer Token required
- **Headers:** `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`

#### Query Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `integer` | Yes | Announcement ID |

#### Request Parameters (Body)
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `title` | `string` | No | Updated title (preserves existing if omitted) |
| `content` | `string` | No | Updated content (preserves existing if omitted) |
| `category` | `string` | No | Updated category (preserves existing if omitted) |

#### Request Example
```json
{
  "title": "Science Exhibition 2026 - Venue Confirmed",
  "content": "Exhibition will now be conducted in the Main Auditorium."
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Announcement ID 3 updated successfully!",
  "announcement": {
    "id": 3,
    "title": "Science Exhibition 2026 - Venue Confirmed",
    "content": "Exhibition will now be conducted in the Main Auditorium.",
    "category": "Academic",
    "created_at": "2026-11-09T11:15:00.000Z",
    "updated_at": "2026-11-09T11:20:00.000Z"
  }
}
```

#### Error Responses
- **`400 Bad Request`** (Missing query ID):
  ```json
  {
    "success": false,
    "message": "Announcement ID is required in query parameters"
  }
  ```
- **`404 Not Found`** (ID does not exist):
  ```json
  {
    "success": false,
    "message": "Announcement not found"
  }
  ```

---

### 2.4 Delete Announcement
- **Method:** `DELETE`
- **URL:** `/api/admin/announcements?id=:id`
- **Authentication:** Bearer Token required
- **Headers:** `Authorization: Bearer <TOKEN>`

#### Query Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `integer` | Yes | Announcement ID to delete |

#### Request Example
```http
DELETE /api/admin/announcements?id=3 HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Announcement ID 3 deleted successfully!"
}
```

#### Error Responses
- **`400 Bad Request`** (Missing query ID or record not found):
  ```json
  {
    "success": false,
    "message": "Announcement not found"
  }
  ```

---

## 3. Functionality 2: Academic Calendars Management

### 3.1 List All Calendars
- **Method:** `GET`
- **URL:** `/api/admin/calendars`
- **Authentication:** Bearer Token required
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Sorting:** Newest to oldest (`created_at DESC`)

#### Request Example
```http
GET /api/admin/calendars HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "count": 1,
  "calendars": [
    {
      "id": 1,
      "title": "Academic Calendar 2026-2027",
      "description": "Annual academic milestones and examination dates",
      "file_path": "/uploads/calendars/calendar-1794211361137-254226641.pdf",
      "file_url": "/uploads/calendars/calendar-1794211361137-254226641.pdf",
      "created_at": "2026-11-09T08:02:41.000Z",
      "updated_at": "2026-11-09T08:02:41.000Z"
    }
  ]
}
```

---

### 3.2 Upload Calendar PDF
- **Method:** `POST`
- **URL:** `/api/admin/calendars`
- **Authentication:** Bearer Token required
- **Content-Type:** `multipart/form-data`
- **Max File Size:** 10 MB
- **Allowed MIME / Ext:** `application/pdf`, `.pdf` (Enforces `%PDF` binary magic bytes)

#### Form-Data Parameters
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `title` | `text` | Yes | Calendar title |
| `description` | `text` | No | Additional notes or description |
| `file` | `file` | Yes | PDF file document (Max 10MB) |

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Calendar PDF uploaded successfully!",
  "calendar": {
    "id": 2,
    "title": "Primary Section Exam Calendar",
    "description": "Mid-term examination milestones",
    "file_path": "/uploads/calendars/calendar-1794211459271-767900982.pdf",
    "file_url": "/uploads/calendars/calendar-1794211459271-767900982.pdf",
    "created_at": "2026-11-09T11:30:00.000Z",
    "updated_at": "2026-11-09T11:30:00.000Z"
  }
}
```

#### Error Responses
- **`400 Bad Request`** (Missing title or file):
  ```json
  {
    "success": false,
    "message": "Title and a PDF file are required via form-data"
  }
  ```
- **`400 Bad Request`** (Non-PDF file selected):
  ```json
  {
    "success": false,
    "message": "Multer Upload Error",
    "error": "Only PDF files are allowed!"
  }
  ```
- **`400 Bad Request`** (File exceeds 10MB):
  ```json
  {
    "success": false,
    "message": "Multer Upload Error",
    "error": "File too large"
  }
  ```
- **`400 Bad Request`** (Fake PDF with invalid magic bytes):
  ```json
  {
    "success": false,
    "message": "Invalid file content: Uploaded file is not a valid PDF document."
  }
  ```

---

### 3.3 Delete Calendar
- **Method:** `DELETE`
- **URL:** `/api/admin/calendars?id=:id`
- **Authentication:** Bearer Token required
- **Behavior:** Unlinks the physical PDF file asynchronously, then deletes the database row.

#### Query Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `integer` | Yes | Calendar ID to delete |

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Calendar ID 2 deleted successfully!"
}
```

#### Error Responses
- **`400 Bad Request`** (Missing query ID):
  ```json
  {
    "success": false,
    "message": "Calendar ID is required in query parameters"
  }
  ```
- **`404 Not Found`** (Record not found):
  ```json
  {
    "success": false,
    "message": "Calendar not found"
  }
  ```

---

## 4. Functionality 3: Media Galleries Management

### 4.1 List All Galleries
- **Method:** `GET`
- **URL:** `/api/admin/galleries`
- **Authentication:** Bearer Token required
- **Sorting:** Newest to oldest (`created_at DESC`)

#### Request Example
```http
GET /api/admin/galleries HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Success Response (`200 OK`)
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

---

### 4.2 Upload Gallery Image
- **Method:** `POST`
- **URL:** `/api/admin/galleries`
- **Authentication:** Bearer Token required
- **Content-Type:** `multipart/form-data`
- **Max File Size:** 5 MB
- **Allowed MIME / Ext:** Images only (`.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`) (Enforces binary image headers)

#### Form-Data Parameters
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `title` | `text` | Yes | Image title |
| `description` | `text` | No | Image caption or description |
| `image` | `file` | Yes | Image file (Max 5MB) |

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Gallery image uploaded successfully!",
  "gallery": {
    "id": 2,
    "title": "Science Lab Inauguration",
    "description": "Opening of state-of-the-art robotics wing",
    "image_path": "/uploads/galleries/gallery-1794212987654-123456789.png",
    "created_at": "2026-11-09T11:45:00.000Z",
    "updated_at": "2026-11-09T11:45:00.000Z"
  }
}
```

#### Error Responses
- **`400 Bad Request`** (Missing title or image):
  ```json
  {
    "success": false,
    "message": "Title and an image file are required via form-data"
  }
  ```
- **`400 Bad Request`** (Non-image file selected):
  ```json
  {
    "success": false,
    "message": "Multer Upload Error",
    "error": "Only image files are allowed for galleries!"
  }
  ```
- **`400 Bad Request`** (File exceeds 5MB):
  ```json
  {
    "success": false,
    "message": "Multer Upload Error",
    "error": "File too large"
  }
  ```
- **`400 Bad Request`** (Fake image with invalid magic bytes):
  ```json
  {
    "success": false,
    "message": "Invalid file content: Uploaded file is not a valid image."
  }
  ```

---

### 4.3 Edit Gallery Item
- **Method:** `PUT`
- **URL:** `/api/admin/galleries?id=:id`
- **Authentication:** Bearer Token required
- **Content-Type:** `multipart/form-data`

#### Query Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `integer` | Yes | Gallery item ID |

#### Form-Data Parameters
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `title` | `text` | No | Updated title |
| `description` | `text` | No | Updated description |
| `image` | `file` | No | Replacement image file (deletes old image automatically) |

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Gallery ID 2 updated successfully!",
  "gallery": {
    "id": 2,
    "title": "Science Lab Inauguration - Revised",
    "description": "Updated description",
    "image_path": "/uploads/galleries/gallery-1794213000000-987654321.png",
    "created_at": "2026-11-09T11:45:00.000Z",
    "updated_at": "2026-11-09T11:50:00.000Z"
  }
}
```

#### Error Responses
- **`400 Bad Request`** (Missing query ID):
  ```json
  {
    "success": false,
    "message": "Gallery ID is required in query parameters"
  }
  ```
- **`404 Not Found`** (Item not found):
  ```json
  {
    "success": false,
    "message": "Gallery item not found"
  }
  ```

---

### 4.4 Delete Gallery Item
- **Method:** `DELETE`
- **URL:** `/api/admin/galleries?id=:id`
- **Authentication:** Bearer Token required
- **Behavior:** Unlinks the physical image file asynchronously, then deletes the database row.

#### Query Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `integer` | Yes | Gallery item ID to delete |

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Gallery ID 2 deleted successfully!"
}
```

#### Error Responses
- **`400 Bad Request`** (Missing query ID):
  ```json
  {
    "success": false,
    "message": "Gallery ID is required in query parameters"
  }
  ```
- **`404 Not Found`** (Item not found):
  ```json
  {
    "success": false,
    "message": "Gallery item not found"
  }
  ```

---

## 5. Functionality 4: Thirukkural Couplets

### 5.1 List All Thirukkural Verses
- **Method:** `GET`
- **URL:** `/api/admin/thirukkural`
- **Authentication:** Bearer Token required
- **Sorting:** Ascending by verse number (`kural_number ASC`)

#### Request Example
```http
GET /api/admin/thirukkural HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Success Response (`200 OK`)
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

---

### 5.2 Add New Thirukkural Verse
- **Method:** `POST`
- **URL:** `/api/admin/thirukkural`
- **Authentication:** Bearer Token required
- **Headers:** `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`

#### Request Parameters (Body)
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `kural_number` | `integer` | Yes | Unique verse number (1 to 1330) |
| `tamil_text` | `string` | Yes | Tamil couplet text |
| `english_meaning` | `string` | Yes | English translation |
| `explanation` | `string` | No | Philosophical or literary explanation |

#### Request Example
```json
{
  "kural_number": 2,
  "tamil_text": "கற்றதனா லாய பயனென்கொல் வாலறிவன்\nநற்றாள் தொழாஅர் எனின்.",
  "english_meaning": "What does learning profit a man, if he doesn't worship the sacred feet of Him who is pure intelligence?",
  "explanation": "True wisdom finds its completion in revering the divine."
}
```

#### Success Response (`200 OK`)
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
    "created_at": "2026-11-09T12:00:00.000Z",
    "updated_at": "2026-11-09T12:00:00.000Z"
  }
}
```

#### Error Responses
- **`400 Bad Request`** (Missing required fields):
  ```json
  {
    "success": false,
    "message": "kural_number, tamil_text, and english_meaning are required"
  }
  ```
- **`400 Bad Request`** (Duplicate kural number):
  ```json
  {
    "success": false,
    "message": "Kural number 2 already exists"
  }
  ```

---

### 5.3 Edit Thirukkural Verse
- **Method:** `PUT`
- **URL:** `/api/admin/thirukkural?id=:id`
- **Authentication:** Bearer Token required
- **Headers:** `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`

#### Query Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `integer` | Yes | Thirukkural database ID |

#### Request Parameters (Body)
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `kural_number` | `integer` | No | Updated verse number |
| `tamil_text` | `string` | No | Updated Tamil couplet |
| `english_meaning` | `string` | No | Updated English translation |
| `explanation` | `string` | No | Updated explanation text |

#### Success Response (`200 OK`)
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
    "created_at": "2026-11-09T12:00:00.000Z",
    "updated_at": "2026-11-09T12:05:00.000Z"
  }
}
```

#### Error Responses
- **`400 Bad Request`** (Missing query ID):
  ```json
  {
    "success": false,
    "message": "Kural ID is required in query parameters"
  }
  ```
- **`404 Not Found`** (Verse ID does not exist):
  ```json
  {
    "success": false,
    "message": "Thirukkural not found"
  }
  ```

---

### 5.4 Delete Thirukkural Verse
- **Method:** `DELETE`
- **URL:** `/api/admin/thirukkural?id=:id`
- **Authentication:** Bearer Token required

#### Query Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `integer` | Yes | Thirukkural ID to delete |

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Thirukkural ID 2 deleted successfully!"
}
```

#### Error Responses
- **`400 Bad Request`** (Missing query ID):
  ```json
  {
    "success": false,
    "message": "Kural ID is required in query parameters"
  }
  ```
- **`404 Not Found`** (ID does not exist):
  ```json
  {
    "success": false,
    "message": "Thirukkural not found"
  }
  ```

---

## 6. Functionality 5: Admin Profile Management

### 6.1 Get Admin Profile
- **Method:** `GET`
- **URL:** `/api/admin/profile`
- **Authentication:** Bearer Token required
- **Description:** Returns the profile of the currently authenticated administrator (`req.admin.id`).

#### Request Example
```http
GET /api/admin/profile HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Success Response (`200 OK`)
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
    "bio": "Serving as educational leader for 15+ years.",
    "emergency_contact_phone": "+91 9876543299",
    "linkedin_url": "https://linkedin.com/in/brito-headmaster",
    "created_at": "2026-11-09T08:15:00.000Z",
    "updated_at": "2026-11-09T08:15:00.000Z"
  }
}
```

#### Error Response (`404 Not Found`)
```json
{
  "success": false,
  "message": "Profile not found for this admin"
}
```

---

### 6.2 Create Admin Profile
- **Method:** `POST`
- **URL:** `/api/admin/profile`
- **Authentication:** Bearer Token required
- **Headers:** `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`

#### Request Parameters (Body)
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `full_name` | `string` | Yes | Administrator full name |
| `alternative_email` | `string` | Yes | Secondary contact email |
| `phone_primary` | `string` | No | Primary phone number |
| `phone_secondary` | `string` | No | Secondary phone number |
| `School_location` | `string` | No | Campus or school branch |
| `bio` | `string` | No | Biography text |
| `emergency_contact_phone` | `string` | No | Emergency phone contact |
| `linkedin_url` | `string` | No | LinkedIn profile URL |

#### Request Example
```json
{
  "full_name": "Headmaster Robert",
  "alternative_email": "headmaster@britoschool.com",
  "phone_primary": "+91 9876543210",
  "phone_secondary": "+91 9876543211",
  "School_location": "Main Campus, Chennai",
  "bio": "Educational leader dedicated to student growth.",
  "emergency_contact_phone": "+91 9876543299",
  "linkedin_url": "https://linkedin.com/in/brito-headmaster"
}
```

#### Success Response (`200 OK`)
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
    "phone_secondary": "+91 9876543211",
    "School_location": "Main Campus, Chennai",
    "bio": "Educational leader dedicated to student growth.",
    "emergency_contact_phone": "+91 9876543299",
    "linkedin_url": "https://linkedin.com/in/brito-headmaster",
    "created_at": "2026-11-09T12:15:00.000Z",
    "updated_at": "2026-11-09T12:15:00.000Z"
  }
}
```

#### Error Responses
- **`400 Bad Request`** (Missing required fields):
  ```json
  {
    "success": false,
    "message": "full_name and alternative_email are required fields"
  }
  ```
- **`400 Bad Request`** (Profile already exists):
  ```json
  {
    "success": false,
    "message": "Profile already exists. Use PUT to update your details."
  }
  ```

---

### 6.3 Update Admin Profile
- **Method:** `PUT`
- **URL:** `/api/admin/profile`
- **Authentication:** Bearer Token required
- **Behavior:** Merges received fields with existing database values; omitted fields retain their existing values.

#### Request Parameters (Body)
Any subset of profile fields (`full_name`, `alternative_email`, `phone_primary`, `phone_secondary`, `School_location`, `bio`, `emergency_contact_phone`, `linkedin_url`).

#### Request Example
```json
{
  "bio": "Updated vision for school academic year 2026-2027.",
  "School_location": "North Wing, Chennai"
}
```

#### Success Response (`200 OK`)
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
    "School_location": "North Wing, Chennai",
    "bio": "Updated vision for school academic year 2026-2027.",
    "emergency_contact_phone": "+91 9876543299",
    "linkedin_url": "https://linkedin.com/in/brito-headmaster",
    "created_at": "2026-11-09T12:15:00.000Z",
    "updated_at": "2026-11-09T12:20:00.000Z"
  }
}
```

#### Error Response (`404 Not Found`)
```json
{
  "success": false,
  "message": "Profile not found. Please create one first."
}
```

---

### 6.4 Delete Admin Profile
- **Method:** `DELETE`
- **URL:** `/api/admin/profile`
- **Authentication:** Bearer Token required

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Admin profile deleted successfully!"
}
```

#### Error Response (`404 Not Found`)
```json
{
  "success": false,
  "message": "Profile not found"
}
```

---

## 7. Static Upload File Serving

Static assets are served directly by Express with 1-day browser caching headers (`maxAge: '1d'`, `etag: true`).

### 7.1 Download / View Calendar PDF
- **Method:** `GET`
- **URL:** `/uploads/calendars/:filename`
- **Authentication:** None (Public)
- **Response Headers:** `Content-Type: application/pdf`, `Cache-Control: public, max-age=86400`, `ETag: W/"..."`

### 7.2 Download / View Gallery Image
- **Method:** `GET`
- **URL:** `/uploads/galleries/:filename`
- **Authentication:** None (Public)
- **Response Headers:** `Content-Type: image/jpeg` (or `image/png`), `Cache-Control: public, max-age=86400`, `ETag: W/"..."`


<!-- node scripts/db_cleanup.js -->
