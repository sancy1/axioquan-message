
-- ── Migration 003: Add conversation_id to existing direct_messages table ───
-- The direct_messages table already exists with full messaging features.
-- We add a conversation_id column to link each message to its conversation
-- container. Existing rows get NULL (no conversation yet — table is empty).

-- src/db/migrations/003_add_conversation_id_to_direct_messages.sql

ALTER TABLE direct_messages
  ADD COLUMN IF NOT EXISTS conversation_id UUID
  REFERENCES conversations(id) ON DELETE CASCADE;

-- Index for fetching all messages in a conversation efficiently
CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation_id
  ON direct_messages(conversation_id);

-- Index for fetching messages ordered by time within a conversation
CREATE INDEX IF NOT EXISTS idx_direct_messages_conv_created
  ON direct_messages(conversation_id, created_at DESC);

-- Index on sender for "my sent messages" queries
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_id
  ON direct_messages(sender_id);