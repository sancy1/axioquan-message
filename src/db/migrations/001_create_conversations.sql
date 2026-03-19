
-- ── Migration 001: Create conversations table ──────────────────────────────
-- Conversations are containers that group messages between participants.
-- A direct conversation links two users, optionally within a course context.

-- src/db/migrations/001_create_conversations.sql

CREATE TABLE IF NOT EXISTS conversations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type             VARCHAR(20) NOT NULL DEFAULT 'direct'
                   CHECK (type IN ('direct', 'group')),
  title            VARCHAR(255),
  course_id        UUID REFERENCES courses(id) ON DELETE SET NULL,
  created_by       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_at  TIMESTAMP WITH TIME ZONE,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for fetching conversations by creator
CREATE INDEX IF NOT EXISTS idx_conversations_created_by
  ON conversations(created_by);

-- Index for course-based conversations
CREATE INDEX IF NOT EXISTS idx_conversations_course_id
  ON conversations(course_id);

-- Index for inbox sorting by latest message
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at
  ON conversations(last_message_at DESC NULLS LAST);

-- Auto-update updated_at on any row change
CREATE OR REPLACE FUNCTION update_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_conversations_updated_at();