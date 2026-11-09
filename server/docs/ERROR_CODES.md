# Error Handling & Status Codes Specification

This document details the standardized error handling conventions, HTTP status codes, and JSON error response structures implemented across the Brito School Backend.

---

## 1. Standard Error Response Contract

All error responses strictly adhere to the following JSON structure:

```json
{
  "success": false,
  "message": "Human-readable description of what failed",
  "error": "Optional diagnostic message or stack details in dev"
}
```

---

## 2. HTTP Status Code Catalog

| Status Code | Reason Phrase | Common Triggers in Application |
| :--- | :--- | :--- |
| **`200 OK`** | Success | Request succeeded; returned on successful GET, POST, PUT, DELETE. |
| **`400 Bad Request`** | Validation Error | Missing mandatory body fields, invalid OTP format, mismatched passwords, or missing query `id`. |
| **`401 Unauthorized`** | Authentication Failure | Missing `Authorization` header, invalid Bearer token, expired JWT, or incorrect email/password. |
| **`404 Not Found`** | Resource Missing | Non-existent record ID, account not found by email, or undefined endpoint URL. |
| **`429 Too Many Requests`** | Rate Limit Exceeded | Exceeded allowed requests (30 / 15m on auth; 1000 / 15m on general APIs). |
| **`500 Internal Server Error`** | Server / DB Fault | Uncaught runtime error, database execution failure, or SMTP delivery timeout. |

---

## 3. Specific Error Scenarios & Exact Payloads

### 3.1 Authentication & Token Errors

#### Missing Token (401)
```json
{
  "success": false,
  "message": "Unauthorized: No token provided"
}
```

#### Invalid or Expired Token (401)
```json
{
  "success": false,
  "message": "Unauthorized: Invalid or expired token"
}
```

#### Invalid Login Credentials (401)
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### 3.2 Validation & Input Errors

#### Missing Required Login Fields (400)
```json
{
  "success": false,
  "message": "Email and password are required"
}
```

#### Password Mismatch (400)
```json
{
  "success": false,
  "message": "New password and confirm password do not match"
}
```

#### Password Too Short (400)
```json
{
  "success": false,
  "message": "Password must be at least 6 characters long"
}
```

#### Expired OTP (400)
```json
{
  "success": false,
  "message": "OTP has expired! Please request a new one."
}
```

#### Invalid OTP Code (400)
```json
{
  "success": false,
  "message": "Invalid OTP code."
}
```

#### Missing ID in Query Parameter (400)
```json
{
  "success": false,
  "message": "Announcement ID is required in query parameters"
}
```

#### Duplicate Entity Key (400)
```json
{
  "success": false,
  "message": "Kural number 1 already exists"
}
```

---

### 3.3 File Upload (Multer) Errors

#### Invalid File Mime Type (400)
- Uploading a `.exe` or `.png` to Calendar route:
```json
{
  "success": false,
  "message": "Multer Upload Error",
  "error": "Only PDF files are allowed!"
}
```

- Uploading a `.pdf` or `.docx` to Gallery route:
```json
{
  "success": false,
  "message": "Multer Upload Error",
  "error": "Only image files are allowed for galleries!"
}
```

#### File Size Limit Exceeded (400)
- Calendars limit: `10MB`
- Galleries limit: `5MB`
```json
{
  "success": false,
  "message": "Multer Upload Error",
  "error": "File too large"
}
```

---

### 3.4 Resource Not Found Errors

#### Entity ID Not Found (404)
```json
{
  "success": false,
  "message": "Announcement not found"
}
```

#### Profile Not Found for Current Admin (404)
```json
{
  "success": false,
  "message": "Profile not found for this admin"
}
```

#### Undefined API Endpoint (404)
```json
{
  "success": false,
  "message": "Endpoint not found"
}
```

---

### 3.5 Rate Limiting (429)

#### Rate Limit Exceeded Response
```json
{
  "success": false,
  "message": "Too many authentication attempts. Please try again later.",
  "retryAfterSeconds": 780
}
```

---

### 3.6 Internal Server Errors (500)

#### Server Error Response
```json
{
  "success": false,
  "message": "Server Error",
  "error": "Table 'brito_school.some_table' doesn't exist"
}
```
