-- ============================================================
-- HARTAKU DATABASE SCHEMA v1.0
-- Platform: Supabase / PostgreSQL 15+
-- ============================================================
-- Cara pakai:
--   1. Buat project baru di https://supabase.com
--   2. Buka SQL Editor → paste file ini → klik Run
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ─────────────────────────────────────────────────────────────
-- TABLE 1: users
-- ─────────────────────────────────────────────────────────────
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number    VARCHAR(20) UNIQUE,
  email           VARCHAR(255) UNIQUE,
  display_name    VARCHAR(100),
  avatar_url      TEXT,

  -- Plan & Billing
  plan            VARCHAR(20) NOT NULL DEFAULT 'free',  -- 'free' | 'pro' | 'family'
  plan_expires_at TIMESTAMPTZ,
  item_scan_limit INTEGER NOT NULL DEFAULT 30,

  -- Metadata
  onboarding_done BOOLEAN NOT NULL DEFAULT FALSE,
  referral_code   VARCHAR(20) UNIQUE DEFAULT SUBSTR(MD5(RANDOM()::TEXT), 1, 8),
  referred_by     UUID REFERENCES users(id),

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_email ON users(email);


-- ─────────────────────────────────────────────────────────────
-- TABLE 2: locations
-- Ruangan / lokasi di dalam rumah/kos user
-- ─────────────────────────────────────────────────────────────
CREATE TABLE locations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,  -- 'Kamar Kos', 'Gudang', 'Dapur Kos', dll
  icon        VARCHAR(50),            -- Material Symbol icon name
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_locations_user ON locations(user_id);


-- ─────────────────────────────────────────────────────────────
-- TABLE 3: items  ← TABEL UTAMA
-- Setiap barang dalam inventaris user
-- ─────────────────────────────────────────────────────────────
CREATE TABLE items (
  id                   VARCHAR(20) PRIMARY KEY,   -- Format: HRT-XXXXX
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id          UUID REFERENCES locations(id) ON DELETE SET NULL,

  -- Identitas
  name                 VARCHAR(255) NOT NULL,
  brand                VARCHAR(100),
  model_number         VARCHAR(100),
  serial_number        VARCHAR(100),
  category             VARCHAR(50) NOT NULL,
  -- 'Elektronik' | 'Kamera & Fotografi' | 'Alat Rumah Tangga'
  -- 'Pakaian & Fashion' | 'Otomotif & Riding' | 'Furnitur'
  -- 'Olahraga' | 'Buku & Koleksi' | 'Lainnya'

  -- Harga & Nilai (dalam IDR)
  purchase_price       BIGINT,
  estimated_price      BIGINT NOT NULL DEFAULT 0,
  resale_price_min     BIGINT,
  resale_price_max     BIGINT,
  price_confidence     SMALLINT DEFAULT 70,        -- % akurasi (0–100)

  -- Status Pemakaian
  purchase_date        DATE,
  last_used_at         DATE,
  last_used_days_ago   INTEGER GENERATED ALWAYS AS (
                         CURRENT_DATE - last_used_at
                       ) STORED,

  -- Zombie Detection
  is_zombie            BOOLEAN NOT NULL DEFAULT FALSE,
  zombie_threshold_days INTEGER NOT NULL DEFAULT 60,
  zombie_detected_at   TIMESTAMPTZ,
  zombie_notified      BOOLEAN DEFAULT FALSE,

  -- Kondisi & Garansi
  condition            VARCHAR(100),
  notes                TEXT,
  warranty_until       DATE,
  warranty_provider    VARCHAR(100),

  -- Media
  image_url            TEXT,                       -- Supabase Storage URL / external

  -- AI Scan
  ai_detected          BOOLEAN DEFAULT FALSE,
  ai_scan_confidence   SMALLINT,

  -- Timestamps
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at           TIMESTAMPTZ                 -- soft delete
);

CREATE INDEX idx_items_user      ON items(user_id);
CREATE INDEX idx_items_location  ON items(location_id);
CREATE INDEX idx_items_category  ON items(category);
CREATE INDEX idx_items_zombie    ON items(user_id, is_zombie) WHERE deleted_at IS NULL;
CREATE INDEX idx_items_warranty  ON items(user_id, warranty_until) WHERE warranty_until IS NOT NULL;


-- ─────────────────────────────────────────────────────────────
-- TABLE 4: scan_logs
-- Log setiap scan foto via WhatsApp Bot
-- ─────────────────────────────────────────────────────────────
CREATE TABLE scan_logs (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id              VARCHAR(20) REFERENCES items(id) ON DELETE SET NULL,

  -- Input WhatsApp
  wa_message_id        VARCHAR(255),
  input_type           VARCHAR(20) NOT NULL DEFAULT 'image',  -- 'image' | 'text' | 'voice'
  raw_input_url        TEXT,
  input_text           TEXT,

  -- Output AI Vision
  ai_provider          VARCHAR(50) DEFAULT 'gemini-vision',
  ai_detected_name     VARCHAR(255),
  ai_detected_category VARCHAR(50),
  ai_detected_brand    VARCHAR(100),
  ai_price_estimate    BIGINT,
  ai_response_raw      JSONB,
  ai_tokens_used       INTEGER,

  -- Status
  scan_status          VARCHAR(20) DEFAULT 'pending',
  -- 'pending' | 'processing' | 'complete' | 'failed' | 'rejected_by_user'

  scanned_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at         TIMESTAMPTZ
);

CREATE INDEX idx_scan_logs_user   ON scan_logs(user_id);
CREATE INDEX idx_scan_logs_item   ON scan_logs(item_id);
CREATE INDEX idx_scan_logs_status ON scan_logs(scan_status, scanned_at);


-- ─────────────────────────────────────────────────────────────
-- TABLE 5: price_history
-- Histori harga pasar per barang (scraping berkala)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE price_history (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id       VARCHAR(20) NOT NULL REFERENCES items(id) ON DELETE CASCADE,

  source        VARCHAR(50) NOT NULL,   -- 'tokopedia' | 'shopee' | 'olx' | 'ai_estimate'
  price_min     BIGINT NOT NULL,
  price_max     BIGINT NOT NULL,
  price_median  BIGINT,
  sample_count  INTEGER,
  raw_data_url  TEXT,

  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_price_history_item ON price_history(item_id, recorded_at DESC);


-- ─────────────────────────────────────────────────────────────
-- TABLE 6: listing_drafts
-- Draft listing jual yang di-generate AI (1-Tap Marketplace)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE listing_drafts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id         VARCHAR(20) NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  platform        VARCHAR(30) NOT NULL,   -- 'tokopedia' | 'shopee' | 'olx' | 'facebook'

  title           VARCHAR(255) NOT NULL,
  description     TEXT NOT NULL,
  suggested_price BIGINT NOT NULL,
  price_floor     BIGINT,

  status          VARCHAR(20) DEFAULT 'draft',
  -- 'draft' | 'copied' | 'published' | 'sold'

  published_url   TEXT,
  sold_price      BIGINT,
  sold_at         TIMESTAMPTZ,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listing_drafts_item   ON listing_drafts(item_id);
CREATE INDEX idx_listing_drafts_user   ON listing_drafts(user_id);
CREATE INDEX idx_listing_drafts_status ON listing_drafts(status);


-- ─────────────────────────────────────────────────────────────
-- TABLE 7: warranty_reminders
-- Notifikasi otomatis garansi, servis, dan zombie alert
-- ─────────────────────────────────────────────────────────────
CREATE TABLE warranty_reminders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id         VARCHAR(20) NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  reminder_type   VARCHAR(30) NOT NULL,
  -- 'warranty_expiry' | 'service_due' | 'zombie_alert' | 'price_drop'

  trigger_date    DATE NOT NULL,
  advance_days    INTEGER DEFAULT 30,

  channel         VARCHAR(20) DEFAULT 'whatsapp',  -- 'whatsapp' | 'email'
  sent_at         TIMESTAMPTZ,
  wa_message_id   VARCHAR(255),

  message_title   VARCHAR(255),
  message_body    TEXT,

  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reminders_user    ON warranty_reminders(user_id);
CREATE INDEX idx_reminders_trigger ON warranty_reminders(trigger_date) WHERE is_active = TRUE;


-- ─────────────────────────────────────────────────────────────
-- TABLE 8: subscriptions
-- Data langganan Pro / Family plan
-- ─────────────────────────────────────────────────────────────
CREATE TABLE subscriptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  plan            VARCHAR(20) NOT NULL,       -- 'pro' | 'family'
  billing_cycle   VARCHAR(10) DEFAULT 'monthly',
  price_idr       INTEGER NOT NULL,            -- 19000, 25000, dll

  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ NOT NULL,
  cancelled_at    TIMESTAMPTZ,

  payment_method  VARCHAR(50),                -- 'gopay' | 'ovo' | 'dana' | 'va_bca'
  payment_ref     VARCHAR(255),

  status          VARCHAR(20) DEFAULT 'active',
  -- 'active' | 'expired' | 'cancelled' | 'trialing'

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user   ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status, expires_at);


-- ─────────────────────────────────────────────────────────────
-- TABLE 9: waitlist
-- Lead dari form waitlist Pro di landing / pricing modal
-- ─────────────────────────────────────────────────────────────
CREATE TABLE waitlist (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           VARCHAR(255),
  phone_number    VARCHAR(20),
  name            VARCHAR(100),

  source          VARCHAR(50) DEFAULT 'pricing_modal',
  -- 'pricing_modal' | 'landing_page' | 'referral' | 'tiktok_challenge'

  referral_code   VARCHAR(20),

  notified_at     TIMESTAMPTZ,
  converted_at    TIMESTAMPTZ,
  converted_user_id UUID REFERENCES users(id),

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_waitlist_email ON waitlist(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX idx_waitlist_phone ON waitlist(phone_number) WHERE phone_number IS NOT NULL;


-- ─────────────────────────────────────────────────────────────
-- VIEWS
-- ─────────────────────────────────────────────────────────────

-- Ringkasan inventaris per user
CREATE OR REPLACE VIEW user_inventory_summary AS
SELECT
  u.id            AS user_id,
  u.display_name,
  u.plan,
  COUNT(i.id)                                        AS total_items,
  COALESCE(SUM(i.estimated_price), 0)                AS total_estimated_value,
  COALESCE(SUM(i.purchase_price), 0)                 AS total_purchase_value,
  COUNT(*) FILTER (WHERE i.is_zombie)                AS zombie_count,
  COALESCE(SUM(i.estimated_price) FILTER (WHERE i.is_zombie), 0) AS zombie_idle_value,
  COUNT(*) FILTER (WHERE i.warranty_until > CURRENT_DATE) AS active_warranties
FROM users u
LEFT JOIN items i ON i.user_id = u.id AND i.deleted_at IS NULL
GROUP BY u.id, u.display_name, u.plan;


-- Zombie items yang perlu dikirim notif WA
CREATE OR REPLACE VIEW zombie_items_pending_notification AS
SELECT
  i.*,
  u.phone_number,
  u.display_name
FROM items i
JOIN users u ON u.id = i.user_id
WHERE i.is_zombie = TRUE
  AND i.zombie_notified = FALSE
  AND i.deleted_at IS NULL
  AND i.last_used_days_ago >= i.zombie_threshold_days;
