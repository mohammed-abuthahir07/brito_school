# Brito School API - Quick Reference

A concise cheatsheet of all 22 API endpoints available in the Brito School Backend.

---

## Endpoint Catalog

| Group | Method | Endpoint URL | Auth Required | Description |
| :--- | :--- | :--- | :---: | :--- |
| **System** | `GET` | `/health` | No | Real-time health check, uptime, DB ping latency, and memory metrics |
| **Auth** | `POST` | `/api/admin/login` | No | Authenticate admin, returns JWT token & admin profile summary |
| **Auth** | `POST` | `/api/admin/forgot-password` | No | Generates 6-digit OTP (valid 2 mins) and sends email via Nodemailer |
| **Auth** | `POST` | `/api/admin/reset-password` | No | Validates OTP, hashes new password with bcrypt, clears OTP |
| **Announcements** | `GET` | `/api/admin/announcements` | Yes | List all announcements ordered by `created_at DESC` |
| **Announcements** | `POST` | `/api/admin/announcements` | Yes | Create a new announcement (`title`, `content`, optional `category`) |
| **Announcements** | `PUT` | `/api/admin/announcements?id=:id` | Yes | Update an existing announcement by query `id` |
| **Announcements** | `DELETE` | `/api/admin/announcements?id=:id` | Yes | Delete an announcement by query `id` |
| **Calendars** | `GET` | `/api/admin/calendars` | Yes | List all academic calendar PDF documents ordered by `created_at DESC` |
| **Calendars** | `POST` | `/api/admin/calendars` | Yes | Upload calendar PDF via `multipart/form-data` (max 10MB) |
| **Calendars** | `DELETE` | `/api/admin/calendars?id=:id` | Yes | Delete calendar record and remove physical PDF file |
| **Galleries** | `GET` | `/api/admin/galleries` | Yes | List all gallery images ordered by `created_at DESC` |
| **Galleries** | `POST` | `/api/admin/galleries` | Yes | Upload gallery image via `multipart/form-data` (max 5MB) |
| **Galleries** | `PUT` | `/api/admin/galleries?id=:id` | Yes | Update title, description, or optionally replace image file |
| **Galleries** | `DELETE` | `/api/admin/galleries?id=:id` | Yes | Delete gallery record and remove physical image file |
| **Thirukkural** | `GET` | `/api/admin/thirukkural` | Yes | List all Thirukkural verses ordered by `kural_number ASC` |
| **Thirukkural** | `POST` | `/api/admin/thirukkural` | Yes | Add new verse (`kural_number`, `tamil_text`, `english_meaning`, `explanation`) |
| **Thirukkural** | `PUT` | `/api/admin/thirukkural?id=:id` | Yes | Update existing verse by query `id` |
| **Thirukkural** | `DELETE` | `/api/admin/thirukkural?id=:id` | Yes | Delete a verse by query `id` |
| **Profile** | `GET` | `/api/admin/profile` | Yes | Retrieve full profile for the authenticated admin (`req.admin.id`) |
| **Profile** | `POST` | `/api/admin/profile` | Yes | Create profile for authenticated admin (fails if already exists) |
| **Profile** | `PUT` | `/api/admin/profile` | Yes | Update profile fields (merges with existing values) |
| **Profile** | `DELETE` | `/api/admin/profile` | Yes | Delete profile for authenticated admin |
| **Static Uploads**| `GET` | `/uploads/*` | No | Serve static PDF calendars and gallery images with `1d` caching |

---

## Authentication Header
All protected endpoints require:
```http
Authorization: Bearer <YOUR_JWT_TOKEN>
```
