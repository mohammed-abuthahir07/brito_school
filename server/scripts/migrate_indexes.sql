-- Migration Script: Add Performance Indexes for Brito School Backend
-- Purpose: Optimize ORDER BY created_at DESC queries and prevent table filesorts
-- Target Tables: announcements, calendars, galleries

USE `brito_school`;

-- 1. Index on announcements (created_at DESC)
-- Optimizes GET /api/admin/announcements
CREATE INDEX idx_announcements_created_at ON announcements (created_at DESC);

-- 2. Index on calendars (created_at DESC)
-- Optimizes GET /api/admin/calendars
CREATE INDEX idx_calendars_created_at ON calendars (created_at DESC);

-- 3. Index on galleries (created_at DESC)
-- Optimizes GET /api/admin/galleries
CREATE INDEX idx_galleries_created_at ON galleries (created_at DESC);
