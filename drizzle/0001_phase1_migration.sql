-- Phase 1 Migration: Add invite_code to groups, waitlist_position to rsvps
-- Run this AFTER the initial schema migration

-- Add invite_code column to groups (if not exists)
ALTER TABLE groups ADD COLUMN invite_code TEXT;

-- Create unique index on invite_code
CREATE UNIQUE INDEX IF NOT EXISTS idx_groups_invite_code ON groups(invite_code);

-- Add waitlist_position column to rsvps (if not exists)
ALTER TABLE rsvps ADD COLUMN waitlist_position INTEGER;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_events_group_id ON events(group_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_rsvps_event_id ON rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_user_id ON rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_status ON rsvps(status);
