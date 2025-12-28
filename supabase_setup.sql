-- ============================================
-- SUPABASE DATABASE SETUP SCRIPT
-- Chạy script này trong Supabase SQL Editor
-- ============================================

-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  -- Primary Key
  uid BIGSERIAL PRIMARY KEY,
  
  -- Authentication
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  session_token TEXT,
  last_login_time TIMESTAMP WITH TIME ZONE,
  
  -- Profile
  phone TEXT,
  email TEXT,
  full_name TEXT,
  
  -- Financial (CHỈ BANKER QUẢN LÝ)
  wallet_balance NUMERIC(15, 2) DEFAULT 0 CHECK (wallet_balance >= 0),
  total_commission NUMERIC(15, 2) DEFAULT 0,
  
  -- Orders Quota (CHỈ BANKER QUẢN LÝ)
  order_quota_max INTEGER DEFAULT 50 CHECK (order_quota_max >= 0),
  order_quota_used INTEGER DEFAULT 0 CHECK (order_quota_used >= 0),
  pending_orders INTEGER DEFAULT 0 CHECK (pending_orders >= 0),
  
  -- Account Info (CHỈ BANKER QUẢN LÝ)
  vip_level TEXT DEFAULT 'VIP1' CHECK (vip_level IN ('VIP1', 'VIP2', 'VIP3', 'VIP4', 'VIP5')),
  credit_score INTEGER DEFAULT 100 CHECK (credit_score >= 0 AND credit_score <= 1000),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  
  -- Security
  auth_code TEXT,
  withdrawal_password TEXT,
  
  -- Timestamps
  register_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_vip_level ON users(vip_level);

-- 2. ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  -- Primary Key
  order_id TEXT PRIMARY KEY,
  
  -- User reference
  uid BIGINT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  username TEXT NOT NULL,
  
  -- Product info
  product_name TEXT NOT NULL,
  product_image TEXT,
  
  -- Financial
  order_amount NUMERIC(15, 2) NOT NULL CHECK (order_amount >= 0),
  commission NUMERIC(15, 2) NOT NULL CHECK (commission >= 0),
  required_balance NUMERIC(15, 2) NOT NULL CHECK (required_balance >= 0),
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed')),
  vip_level TEXT NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_time TIMESTAMP WITH TIME ZONE
);

-- Indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_uid ON orders(uid);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- 3. PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  -- Primary Key
  id BIGSERIAL PRIMARY KEY,
  
  -- Product info
  name TEXT NOT NULL,
  price NUMERIC(15, 2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  description TEXT,
  
  -- Discount
  discount_amount NUMERIC(15, 2) DEFAULT 0 CHECK (discount_amount >= 0),
  discount_percent NUMERIC(5, 2) DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  
  -- Stock & limits
  max_order_quantity TEXT,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  
  -- Category & features
  category TEXT,
  is_featured BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for products
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- 4. TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  -- Primary Key
  transaction_id TEXT PRIMARY KEY,
  
  -- User reference
  uid BIGINT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  
  -- Transaction info
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'commission', 'order_deduction')),
  amount NUMERIC(15, 2) NOT NULL,
  balance_before NUMERIC(15, 2) NOT NULL,
  balance_after NUMERIC(15, 2) NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Note
  note TEXT
);

-- Indexes for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_uid ON transactions(uid);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- 5. AUTH CODES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS auth_codes (
  -- Primary Key
  code TEXT PRIMARY KEY,
  
  -- Usage tracking
  is_used BOOLEAN DEFAULT false,
  used_by_uid BIGINT REFERENCES users(uid) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for auth_codes
CREATE INDEX IF NOT EXISTS idx_auth_codes_is_used ON auth_codes(is_used);

-- 6. TRIGGER FUNCTION - Auto update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to products
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. INSERT SAMPLE DATA
-- ============================================

-- Insert 10 authorization codes
INSERT INTO auth_codes (code) VALUES
  ('AUTH2025001'),
  ('AUTH2025002'),
  ('AUTH2025003'),
  ('AUTH2025004'),
  ('AUTH2025005'),
  ('AUTH2025006'),
  ('AUTH2025007'),
  ('AUTH2025008'),
  ('AUTH2025009'),
  ('AUTH2025010')
ON CONFLICT (code) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, price, image_url, description, discount_amount, discount_percent, stock, category, is_featured)
VALUES
  (
    'JmFu/Chang/0.7U1.VL2Lj Manual Hand Operated Meat Grinder',
    3457.00,
    'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=500',
    'Gourmet Cuisine Hand Pat Chopper Meat Blender Grinder - High quality kitchen appliance',
    432.13,
    12.5,
    10,
    'Kitchen Appliances',
    true
  ),
  (
    'Wireless Bluetooth Headphones Premium',
    1250.00,
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    'Premium noise-cancelling wireless headphones with superior sound quality',
    125.00,
    10.0,
    25,
    'Electronics',
    true
  ),
  (
    'Stainless Steel Insulated Water Bottle',
    450.00,
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
    'Insulated 1L water bottle - keeps drinks cold for 24h, hot for 12h',
    45.00,
    10.0,
    50,
    'Sports & Outdoors',
    false
  ),
  (
    'Smart LED Desk Lamp with USB Charging',
    890.00,
    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500',
    'Adjustable brightness LED lamp with built-in USB charging port',
    89.00,
    10.0,
    30,
    'Home & Office',
    true
  ),
  (
    'Portable Power Bank 20000mAh',
    650.00,
    'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500',
    'High capacity portable charger with fast charging support',
    65.00,
    10.0,
    40,
    'Electronics',
    false
  )
ON CONFLICT DO NOTHING;

-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_codes ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid()::text = uid::text OR true); -- Temporary: allow all reads

DROP POLICY IF EXISTS "Allow public registration" ON users;
CREATE POLICY "Allow public registration"
  ON users FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = uid::text OR true); -- Temporary: allow all updates

-- Orders policies
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  USING (auth.uid()::text = uid::text OR true); -- Temporary: allow all reads

DROP POLICY IF EXISTS "System can create orders" ON orders;
CREATE POLICY "System can create orders"
  ON orders FOR INSERT
  WITH CHECK (true); -- Temporary: allow all inserts

DROP POLICY IF EXISTS "System can update orders" ON orders;
CREATE POLICY "System can update orders"
  ON orders FOR UPDATE
  USING (true); -- Temporary: allow all updates

-- Products policies
DROP POLICY IF EXISTS "Anyone can read products" ON products;
CREATE POLICY "Anyone can read products"
  ON products FOR SELECT
  USING (true);

-- Transactions policies
DROP POLICY IF EXISTS "Users can read own transactions" ON transactions;
CREATE POLICY "Users can read own transactions"
  ON transactions FOR SELECT
  USING (auth.uid()::text = uid::text OR true); -- Temporary: allow all reads

DROP POLICY IF EXISTS "System can create transactions" ON transactions;
CREATE POLICY "System can create transactions"
  ON transactions FOR INSERT
  WITH CHECK (true);

-- Auth codes policies
DROP POLICY IF EXISTS "Anyone can read auth codes" ON auth_codes;
CREATE POLICY "Anyone can read auth codes"
  ON auth_codes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "System can update auth codes" ON auth_codes;
CREATE POLICY "System can update auth codes"
  ON auth_codes FOR UPDATE
  USING (true);

-- ============================================
-- SETUP COMPLETE
-- ============================================

-- Verify tables created
SELECT 
  tablename,
  (SELECT count(*) FROM pg_indexes WHERE tablename = t.tablename) as index_count
FROM pg_tables t
WHERE schemaname = 'public'
  AND tablename IN ('users', 'orders', 'products', 'transactions', 'auth_codes')
ORDER BY tablename;

-- Check auth codes
SELECT code, is_used FROM auth_codes ORDER BY code;

-- Check products
SELECT id, name, price, is_featured FROM products ORDER BY id;
