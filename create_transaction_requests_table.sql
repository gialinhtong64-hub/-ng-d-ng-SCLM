-- ================================================
-- CREATE TRANSACTION REQUESTS TABLE
-- Table để lưu yêu cầu nạp/rút tiền
-- ================================================

CREATE TABLE IF NOT EXISTS transaction_requests (
  -- Primary Key
  id BIGSERIAL PRIMARY KEY,
  
  -- User Info
  uid BIGINT NOT NULL,
  username TEXT NOT NULL,
  
  -- Transaction Info
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdraw')),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  method TEXT NOT NULL,
  
  -- Optional Details
  bank_info TEXT,
  wallet_address TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  note TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Foreign Key (optional - nếu muốn enforce relationship)
  CONSTRAINT fk_user FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX idx_transaction_requests_uid ON transaction_requests(uid);
CREATE INDEX idx_transaction_requests_type ON transaction_requests(type);
CREATE INDEX idx_transaction_requests_status ON transaction_requests(status);
CREATE INDEX idx_transaction_requests_created_at ON transaction_requests(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE transaction_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Policy 1: User chỉ xem được request của mình
CREATE POLICY "Users can view their own requests"
  ON transaction_requests
  FOR SELECT
  USING (uid = (current_setting('request.jwt.claims', true)::json->>'uid')::bigint);

-- Policy 2: User có thể tạo request của mình
CREATE POLICY "Users can create their own requests"
  ON transaction_requests
  FOR INSERT
  WITH CHECK (uid = (current_setting('request.jwt.claims', true)::json->>'uid')::bigint);

-- Policy 3: Banker/Admin có thể xem tất cả (cần set role admin trong JWT)
CREATE POLICY "Admins can view all requests"
  ON transaction_requests
  FOR ALL
  USING (
    (current_setting('request.jwt.claims', true)::json->>'role')::text = 'admin'
  );

-- ================================================
-- ENABLE REALTIME
-- ================================================
ALTER PUBLICATION supabase_realtime ADD TABLE transaction_requests;

-- ================================================
-- SAMPLE DATA (Optional - for testing)
-- ================================================
-- Uncomment để thêm data test
/*
INSERT INTO transaction_requests (uid, username, type, amount, method, status) VALUES
  (1, 'test_user', 'deposit', 100.00, 'Chuyển khoản', 'pending'),
  (1, 'test_user', 'withdraw', 50.00, 'USDT TRC20', 'approved'),
  (2, 'user2', 'deposit', 200.00, 'Momo', 'pending');
*/
