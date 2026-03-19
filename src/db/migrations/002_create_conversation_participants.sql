

-- ── Migration 002: Create conversation_participants table ──────────────────
-- Tracks which users belong to which conversations and their roles.
-- Also tracks the last time each participant read the conversation
-- for unread message count calculations.

-- src/db/migrations/002_create_conversation_participants.sql

CREATE TABLE IF NOT EXISTS conversation_participants (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role             VARCHAR(20) NOT NULL DEFAULT 'student'
                   CHECK (role IN ('student', 'instructor', 'admin')),
  joined_at        TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_read_at     TIMESTAMP WITH TIME ZONE,

  -- One user can only appear once per conversation
  UNIQUE(conversation_id, user_id)
);

-- Index for fetching all conversations a user belongs to
CREATE INDEX IF NOT EXISTS idx_conv_participants_user_id
  ON conversation_participants(user_id);

-- Index for fetching all participants in a conversation
CREATE INDEX IF NOT EXISTS idx_conv_participants_conversation_id
  ON conversation_participants(conversation_id);