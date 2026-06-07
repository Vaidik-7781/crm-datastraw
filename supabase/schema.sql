-- ============================================
-- DATASTRAW CRM — SUPABASE SCHEMA (COMPLETE)
-- Run this in Supabase SQL Editor
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---- TICKETS TABLE ----
CREATE TABLE tickets (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id     VARCHAR(20) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  subject       VARCHAR(500) NOT NULL,
  description   TEXT NOT NULL,
  status        VARCHAR(20) NOT NULL DEFAULT 'Open'
                  CHECK (status IN ('Open', 'In Progress', 'Closed', 'Resolved')),
  priority      VARCHAR(20) NOT NULL DEFAULT 'Medium'
                  CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  category      VARCHAR(50) NOT NULL DEFAULT 'General'
                  CHECK (category IN ('Technical', 'Billing', 'Feature Request', 'General', 'Bug')),
  assigned_to   VARCHAR(255),
  ai_category   VARCHAR(50),
  ai_priority   VARCHAR(20),
  ai_sentiment  VARCHAR(20),
  ai_summary    TEXT,
  ai_suggested_response TEXT,
  resolved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ---- NOTES TABLE ----
CREATE TABLE notes (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id   VARCHAR(20) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
  note_text   TEXT NOT NULL,
  author      VARCHAR(255) NOT NULL DEFAULT 'Support Agent',
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ---- ACTIVITY LOG TABLE ----
CREATE TABLE activity_log (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id     VARCHAR(20) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
  action        VARCHAR(50) NOT NULL,
  old_value     TEXT,
  new_value     TEXT,
  performed_by  VARCHAR(255) NOT NULL DEFAULT 'Support Agent',
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ---- AGENTS TABLE ----
CREATE TABLE agents (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  email        VARCHAR(255) UNIQUE NOT NULL,
  role         VARCHAR(20) NOT NULL DEFAULT 'Agent'
                 CHECK (role IN ('Admin', 'Agent', 'Viewer')),
  avatar_color VARCHAR(20) NOT NULL DEFAULT '#6366F1',
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ---- QUICK REPLIES TABLE ----
CREATE TABLE quick_replies (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title      VARCHAR(255) NOT NULL,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ---- AUTO-UPDATE updated_at TRIGGER ----
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER quick_replies_updated_at
  BEFORE UPDATE ON quick_replies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---- INDEXES ----
CREATE INDEX idx_tickets_status      ON tickets(status);
CREATE INDEX idx_tickets_priority    ON tickets(priority);
CREATE INDEX idx_tickets_category    ON tickets(category);
CREATE INDEX idx_tickets_created_at  ON tickets(created_at DESC);
CREATE INDEX idx_tickets_email       ON tickets(customer_email);
CREATE INDEX idx_notes_ticket_id     ON notes(ticket_id);
CREATE INDEX idx_activity_ticket_id  ON activity_log(ticket_id);
CREATE INDEX idx_agents_email        ON agents(email);

-- ---- ROW LEVEL SECURITY (Public for MVP — no auth) ----
ALTER TABLE tickets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log  ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents        ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_all_tickets"       ON tickets       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_notes"         ON notes         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_activity_log"  ON activity_log  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_agents"        ON agents        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_quick_replies" ON quick_replies FOR ALL USING (true) WITH CHECK (true);
