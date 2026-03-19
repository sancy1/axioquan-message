
-- ── Migration 005: Create message_notifications table ─────────────────────
-- Localised message notifications owned entirely by the messaging app.
-- Completely separate from the central notifications and
-- realtime_notifications tables which are owned by the main axioquan app.
-- One row per user per message — powers the unread message badge count
-- and the notification feed inside the messaging inbox.

CREATE TABLE IF NOT EXISTS message_notifications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id   UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  message_id        UUID NOT NULL REFERENCES direct_messages(id) ON DELETE CASCADE,
  sender_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_read           BOOLEAN NOT NULL DEFAULT false,
  read_at           TIMESTAMP WITH TIME ZONE,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- One notification per user per message — no duplicates
  UNIQUE(user_id, message_id)
);

-- Fast unread count per user
CREATE INDEX IF NOT EXISTS idx_msg_notifications_user_unread
  ON message_notifications(user_id, is_read)
  WHERE is_read = false;

-- Fast lookup per conversation
CREATE INDEX IF NOT EXISTS idx_msg_notifications_conversation
  ON message_notifications(conversation_id, user_id);

-- Fast lookup per message
CREATE INDEX IF NOT EXISTS idx_msg_notifications_message_id
  ON message_notifications(message_id);