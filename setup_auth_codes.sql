-- ================================================
-- CREATE AUTH CODES TABLE + INSERT DATA
-- ================================================

-- Tạo table nếu chưa có
CREATE TABLE IF NOT EXISTS auth_codes (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_by_uid BIGINT,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key
  CONSTRAINT fk_used_by_user FOREIGN KEY (used_by_uid) 
    REFERENCES users(uid) ON DELETE SET NULL
);

-- Index
CREATE INDEX IF NOT EXISTS idx_auth_codes_code ON auth_codes(code);
CREATE INDEX IF NOT EXISTS idx_auth_codes_is_used ON auth_codes(is_used);

-- Enable RLS
ALTER TABLE auth_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all for testing
CREATE POLICY "Allow all for testing"
  ON auth_codes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert 10 mã ủy quyền
INSERT INTO auth_codes (code, is_used) VALUES
  ('AUTH2025001', false),
  ('AUTH2025002', false),
  ('AUTH2025003', false),
  ('AUTH2025004', false),
  ('AUTH2025005', false),
  ('AUTH2025006', false),
  ('AUTH2025007', false),
  ('AUTH2025008', false),
  ('AUTH2025009', false),
  ('AUTH2025010', false)
ON CONFLICT (code) DO NOTHING;

-- Verify
SELECT * FROM auth_codes ORDER BY code;
