CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id          SERIAL PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  status      TEXT NOT NULL DEFAULT 'active', -- active | unsubscribed
  source      TEXT DEFAULT 'popup',           -- popup | inline | footer
  category    TEXT DEFAULT 'general',         -- which category they came from
  resend_id   TEXT,                           -- Resend contact ID for sync
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscribers(status);
