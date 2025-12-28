// Supabase Client Configuration
// File này chứa cấu hình kết nối đến Supabase backend

import { createClient } from '@supabase/supabase-js';

// 🔥 SUPABASE CONFIGURATION
// Lấy URL và API Key từ Supabase Dashboard
// Project Settings > API > Project URL & Project API keys (anon/public)

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Tạo Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// 🔥 DATABASE TABLES STRUCTURE
// Cần tạo các bảng sau trong Supabase:

/**
 * TABLE: users
 * ============
 * - uid: bigint (primary key, auto-increment)
 * - username: text (unique, not null)
 * - password: text (not null) - Nên hash với bcrypt
 * - phone: text
 * - email: text
 * - full_name: text
 * - wallet_balance: numeric (default 0)
 * - vip_level: text (default 'VIP1')
 * - order_quota_max: integer (default 50)
 * - order_quota_used: integer (default 0)
 * - pending_orders: integer (default 0)
 * - total_commission: numeric (default 0)
 * - credit_score: integer (default 100)
 * - status: text (default 'active') CHECK (status IN ('active', 'inactive', 'suspended'))
 * - register_time: timestamp (default now())
 * - auth_code: text
 * - withdrawal_password: text
 * - session_token: text
 * - last_login_time: timestamp
 * - created_at: timestamp (default now())
 * - updated_at: timestamp (default now())
 */

/**
 * TABLE: orders
 * =============
 * - order_id: text (primary key)
 * - uid: bigint (foreign key → users.uid)
 * - username: text
 * - product_name: text
 * - product_image: text
 * - order_amount: numeric
 * - commission: numeric
 * - required_balance: numeric
 * - created_at: timestamp (default now())
 * - completion_time: timestamp
 * - status: text (default 'pending') CHECK (status IN ('pending', 'processing', 'completed'))
 * - vip_level: text
 */

/**
 * TABLE: products
 * ===============
 * - id: bigint (primary key, auto-increment)
 * - name: text (not null)
 * - price: numeric (not null)
 * - image_url: text
 * - description: text
 * - discount_amount: numeric (default 0)
 * - discount_percent: numeric (default 0)
 * - max_order_quantity: text
 * - stock: integer (default 0)
 * - category: text
 * - is_featured: boolean (default false)
 * - created_at: timestamp (default now())
 * - updated_at: timestamp (default now())
 */

/**
 * TABLE: transactions
 * ===================
 * - transaction_id: text (primary key)
 * - uid: bigint (foreign key → users.uid)
 * - type: text CHECK (type IN ('deposit', 'withdrawal', 'commission', 'order_deduction'))
 * - amount: numeric
 * - balance_before: numeric
 * - balance_after: numeric
 * - status: text CHECK (status IN ('pending', 'approved', 'rejected'))
 * - created_at: timestamp (default now())
 * - processed_at: timestamp
 * - note: text
 */

/**
 * TABLE: auth_codes
 * =================
 * - code: text (primary key)
 * - is_used: boolean (default false)
 * - used_by_uid: bigint (foreign key → users.uid, nullable)
 * - used_at: timestamp
 * - created_at: timestamp (default now())
 */

// Export helper types
export type SupabaseUser = {
  user_id: number;
  username: string;
  password: string;
  phone: string | null;
  email: string | null;
  full_name: string | null;
  wallet_balance: number;
  vip_level: string;
  order_quota_max: number;
  order_quota_used: number;
  pending_orders: number;
  total_commission: number;
  credit_score: number;
  status: 'active' | 'inactive' | 'suspended';
  register_time: string;
  auth_code: string | null;
  withdrawal_password: string | null;
  session_token: string | null;
  last_login_time: string | null;
  created_at: string;
  updated_at: string;
};

export type SupabaseOrder = {
  order_id: string;
  user_id: number;
  username: string;
  product_name: string;
  product_image: string | null;
  order_amount: number;
  commission: number;
  required_balance: number;
  created_at: string;
  completion_time: string | null;
  status: 'pending' | 'processing' | 'completed';
  vip_level: string;
};

export type SupabaseProduct = {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  description: string | null;
  discount_amount: number;
  discount_percent: number;
  max_order_quantity: string | null;
  stock: number;
  category: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};
