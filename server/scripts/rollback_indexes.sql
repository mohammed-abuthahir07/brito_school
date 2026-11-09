-- Rollback Script: Remove Performance Indexes for Brito School Backend
-- Purpose: Safely roll back added indexes if ever needed in schema management
-- Target Tables: announcements, calendars, galleries

USE `brito_school`;

-- 1. Drop index on announcements
DROP INDEX IF EXISTS idx_announcements_created_at ON announcements;

-- 2. Drop index on calendars
DROP INDEX IF EXISTS idx_calendars_created_at ON calendars;

-- 3. Drop index on galleries
DROP INDEX IF EXISTS idx_galleries_created_at ON galleries;
