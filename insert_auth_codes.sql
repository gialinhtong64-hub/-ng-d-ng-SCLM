-- ================================================
-- INSERT AUTH CODES
-- Tạo 10 mã ủy quyền để test
-- ================================================

INSERT INTO auth_codes (code, is_used, created_at) VALUES
  ('AUTH2025001', false, NOW()),
  ('AUTH2025002', false, NOW()),
  ('AUTH2025003', false, NOW()),
  ('AUTH2025004', false, NOW()),
  ('AUTH2025005', false, NOW()),
  ('AUTH2025006', false, NOW()),
  ('AUTH2025007', false, NOW()),
  ('AUTH2025008', false, NOW()),
  ('AUTH2025009', false, NOW()),
  ('AUTH2025010', false, NOW())
ON CONFLICT (code) DO NOTHING;

-- Verify
SELECT * FROM auth_codes ORDER BY code;
