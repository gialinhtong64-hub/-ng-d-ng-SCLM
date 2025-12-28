# 🔥 HƯỚNG DẪN SETUP SUPABASE DATABASE

> **Quan trọng:** Tất cả tài khoản, đơn hàng, số dư phải được đồng bộ lên Supabase.  
> App chỉ đọc dữ liệu từ backend, không tự sinh dữ liệu.

## 📋 MỤC LỤC

1. [Tạo Project Supabase](#1-tạo-project-supabase)
2. [Tạo Database Tables](#2-tạo-database-tables)
3. [Cấu hình App](#3-cấu-hình-app)
4. [Kiểm tra kết nối](#4-kiểm-tra-kết-nối)

---

## 1. TẠO PROJECT SUPABASE

### Bước 1: Đăng ký Supabase
1. Truy cập: https://supabase.com
2. Đăng ký tài khoản miễn phí
3. Tạo project mới (ví dụ: "sclm-app")

### Bước 2: Lấy API Keys
1. Vào **Project Settings** > **API**
2. Copy:
   - `Project URL` (ví dụ: `https://xxxxx.supabase.co`)
   - `anon/public key` (key dài bắt đầu với `eyJhbG...`)

---

## 2. TẠO DATABASE TABLES

### Table 1: `users` - Quản lý tài khoản người dùng

```sql
CREATE TABLE users (
  -- Primary Key
  uid BIGSERIAL PRIMARY KEY,
  
  -- Authentication
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- TODO: Hash với bcrypt
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

-- Index cho tìm kiếm nhanh
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_vip_level ON users(vip_level);

-- Function tự động update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger cho users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Table 2: `orders` - Quản lý đơn hàng

```sql
CREATE TABLE orders (
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

-- Indexes
CREATE INDEX idx_orders_uid ON orders(uid);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

### Table 3: `products` - Danh sách sản phẩm

```sql
CREATE TABLE products (
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

-- Indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Trigger cho products table
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Table 4: `transactions` - Lịch sử giao dịch

```sql
CREATE TABLE transactions (
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

-- Indexes
CREATE INDEX idx_transactions_uid ON transactions(uid);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
```

### Table 5: `auth_codes` - Mã ủy quyền

```sql
CREATE TABLE auth_codes (
  -- Primary Key
  code TEXT PRIMARY KEY,
  
  -- Usage tracking
  is_used BOOLEAN DEFAULT false,
  used_by_uid BIGINT REFERENCES users(uid) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_auth_codes_is_used ON auth_codes(is_used);

-- Insert 10 mã ủy quyền ban đầu
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
  ('AUTH2025010');
```

---

## 3. CẤU HÌNH APP

### Bước 1: Tạo file `.env`

Tạo file `.env` trong thư mục `preview-app/`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Lưu ý:** Thay `your-project-id` và key thật từ Supabase Dashboard.

### Bước 2: Restart dev server

```bash
npm run dev
```

---

## 4. KIỂM TRA KẾT NỐI

### Test đăng ký tài khoản

```typescript
import { registerUser } from './supabaseApi';

const result = await registerUser({
  username: 'testuser',
  password: 'Test123456',
  phone: '0123456789',
  email: 'test@example.com',
  fullName: 'Test User',
  authCode: 'AUTH2025001',
  withdrawalPassword: '123456'
});

console.log(result); // { success: true, user: {...} }
```

### Test đăng nhập

```typescript
import { loginUser } from './supabaseApi';

const result = await loginUser('testuser', 'Test123456');
console.log(result); // { success: true, user: {...} }
```

### Test lấy danh sách sản phẩm

```typescript
import { fetchProducts } from './supabaseApi';

const products = await fetchProducts();
console.log(products); // [...]
```

---

## 5. ROW LEVEL SECURITY (RLS)

**Quan trọng:** Cần bật RLS để bảo mật dữ liệu

### Bật RLS cho từng table

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_codes ENABLE ROW LEVEL SECURITY;
```

### Policy cho `users` table

```sql
-- User có thể đọc thông tin của chính mình
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (uid = (current_setting('request.jwt.claims', true)::json->>'uid')::bigint);

-- Cho phép INSERT (đăng ký)
CREATE POLICY "Allow public registration"
  ON users FOR INSERT
  WITH CHECK (true);

-- User có thể update thông tin cơ bản của mình (không phải số dư, quota)
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (uid = (current_setting('request.jwt.claims', true)::json->>'uid')::bigint)
  WITH CHECK (uid = (current_setting('request.jwt.claims', true)::json->>'uid')::bigint);
```

### Policy cho `orders` table

```sql
-- User chỉ xem được đơn hàng của mình
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  USING (uid = (current_setting('request.jwt.claims', true)::json->>'uid')::bigint);

-- Chỉ backend/admin có thể tạo đơn hàng
CREATE POLICY "Only backend can create orders"
  ON orders FOR INSERT
  WITH CHECK (false); -- Tạm thời block, sẽ config riêng cho service role
```

### Policy cho `products` table

```sql
-- Tất cả có thể đọc products
CREATE POLICY "Anyone can read products"
  ON products FOR SELECT
  USING (true);
```

---

## 6. INSERT DỮ LIỆU MẪU

### Insert sản phẩm mẫu

```sql
INSERT INTO products (name, price, image_url, description, discount_amount, discount_percent, stock, category, is_featured)
VALUES
  ('JmFu/Chang/0.7U1.VL2Lj Manual Hand Operated Meat Grinder', 3457.00, 'https://via.placeholder.com/300', 'Gourmet Cuisine Hand Pat Chopper Meat Blender Grinder', 432.13, 12.5, 10, 'Kitchen Appliances', true),
  ('Wireless Bluetooth Headphones', 1250.00, 'https://via.placeholder.com/300', 'Premium noise-cancelling headphones', 125.00, 10.0, 25, 'Electronics', true),
  ('Stainless Steel Water Bottle', 450.00, 'https://via.placeholder.com/300', 'Insulated 1L water bottle', 45.00, 10.0, 50, 'Sports & Outdoors', false);
```

---

## 7. TROUBLESHOOTING

### Lỗi: "Failed to fetch"
- Kiểm tra URL Supabase có đúng không
- Kiểm tra API key có đúng không
- Kiểm tra internet connection

### Lỗi: "Permission denied"
- Kiểm tra RLS policies
- Đảm bảo đã enable RLS cho table
- Check service role key nếu cần bypass RLS

### Lỗi: "Table does not exist"
- Đảm bảo đã chạy tất cả SQL create table
- Check table name (chữ thường, dấu gạch dưới)

---

## 8. NEXT STEPS

1. ✅ Setup Supabase project
2. ✅ Tạo database tables
3. ✅ Cấu hình .env file
4. ⬜ Test đăng ký/đăng nhập
5. ⬜ Tích hợp vào LoginScreen.tsx
6. ⬜ Tích hợp vào RegisterScreen.tsx
7. ⬜ Tích hợp vào HomeScreen.tsx (products)
8. ⬜ Tích hợp vào OrdersScreen.tsx
9. ⬜ Tích hợp vào WalletScreen.tsx

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, kiểm tra:
- Supabase Dashboard > Table Editor (xem dữ liệu)
- Supabase Dashboard > Logs (xem errors)
- Browser Console (F12) để debug

**Tài liệu Supabase:** https://supabase.com/docs
