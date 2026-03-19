
-- ── Migration 004: Create message_read_receipts table ─────────────────────
-- Localised read tracking owned entirely by the messaging app.
-- Completely separate from the central notifications and
-- realtime_notifications tables which are owned by the main axioquan app.
-- One row per user per message — tracks when each participant read
-- each message for accurate unread counts and read receipts.

-- src/db/migrations/004_create_message_read_receipts.sql

CREATE TABLE IF NOT EXISTS message_read_receipts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id       UUID NOT NULL REFERENCES direct_messages(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  is_read          BOOLEAN NOT NULL DEFAULT false,
  read_at          TIMESTAMP WITH TIME ZONE,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- One receipt per user per message
  UNIQUE(message_id, user_id)
);

-- Index for unread count queries per user
CREATE INDEX IF NOT EXISTS idx_read_receipts_user_unread
  ON message_read_receipts(user_id, is_read)
  WHERE is_read = false;

-- Index for fetching all receipts for a message
CREATE INDEX IF NOT EXISTS idx_read_receipts_message_id
  ON message_read_receipts(message_id);

-- Index for conversation-level unread counts
CREATE INDEX IF NOT EXISTS idx_read_receipts_conversation_id
  ON message_read_receipts(conversation_id, user_id);