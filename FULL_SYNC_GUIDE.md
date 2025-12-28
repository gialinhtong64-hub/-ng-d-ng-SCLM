# 🔥 TÀI LIỆU ĐỒNG BỘ HOÀN TOÀN VỚI SUPABASE

> **Quy tắc vàng:** Tất cả tài khoản phải được đồng bộ lên Supabase.  
> App không tự sinh dữ liệu - mọi thứ đều phải đến từ Backend/Hậu đài.

---

## 📋 OVERVIEW

Hệ thống đã được tích hợp hoàn toàn với Supabase backend:

### ✅ Đã hoàn thành

1. **Supabase Client Setup** (`src/supabase.ts`)
   - Cấu hình kết nối Supabase
   - Type definitions cho database
   - Database schema specification

2. **API Service Layer** (`src/supabaseApi.ts`)
   - `registerUser()` - Đăng ký tài khoản mới
   - `loginUser()` - Xác thực đăng nhập
   - `getUserByUid()` - Lấy thông tin user
   - `updateUser()` - Cập nhật profile
   - `createOrder()` - Tạo đơn hàng
   - `getUserOrders()` - Lấy danh sách đơn
   - `completeOrder()` - Hoàn thành đơn
   - `fetchProducts()` - Lấy danh sách sản phẩm
   - `fetchFeaturedProducts()` - Lấy sản phẩm nổi bật

3. **UI Integration**
   - ✅ LoginScreen.tsx - Sử dụng `loginUser()` API
   - ✅ RegisterScreen.tsx - Sử dụng `registerUser()` API
   - ⬜ HomeScreen.tsx - Cần tích hợp `fetchProducts()`
   - ⬜ OrdersScreen.tsx - Cần tích hợp `getUserOrders()`
   - ⬜ WalletScreen.tsx - Cần hiển thị dữ liệu từ Supabase
   - ⬜ ProfileScreen.tsx - Cần tích hợp `updateUser()`

---

## 🚀 CÁCH SỬ DỤNG

### Bước 1: Setup Supabase Database

Làm theo hướng dẫn trong file `SUPABASE_SETUP.md`:

1. Tạo project trên Supabase
2. Tạo tất cả các tables (users, orders, products, transactions, auth_codes)
3. Insert dữ liệu mẫu (auth codes, products)
4. Setup Row Level Security (RLS)

### Bước 2: Cấu hình App

Tạo file `.env` trong thư mục `preview-app/`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Bước 3: Restart Development Server

```bash
npm run dev
```

---

## 📊 LUỒNG DỮ LIỆU

### 1. Đăng ký tài khoản

```
User fills form → RegisterScreen.tsx
                ↓
         registerUser(userData)
                ↓
         Supabase API
                ↓
    Insert into users table
                ↓
    Check & mark auth_code as used
                ↓
    Return user data
                ↓
    Sync to localStorage (backward compatible)
                ↓
    Navigate to App
```

### 2. Đăng nhập

```
User enters credentials → LoginScreen.tsx
                        ↓
                 loginUser(username, password)
                        ↓
                 Supabase API
                        ↓
        Query users table by username
                        ↓
        Verify password (TODO: bcrypt)
                        ↓
        Check account status
                        ↓
        Generate session_token
                        ↓
        Update session_token in DB
                        ↓
        Return user data
                        ↓
        Save to localStorage
                        ↓
        Navigate to App
```

### 3. Lấy thông tin user (sync mỗi khi mở app)

```
App loads → getUserByUid(uid)
                ↓
         Supabase API
                ↓
    SELECT * FROM users WHERE uid = ?
                ↓
    Return latest data (balance, quota, etc.)
                ↓
    Update app state
```

### 4. Lấy danh sách đơn hàng

```
OrdersScreen loads → getUserOrders(uid)
                        ↓
                  Supabase API
                        ↓
        SELECT * FROM orders WHERE uid = ?
                        ↓
            Return orders list
                        ↓
            Display in UI
```

### 5. Tạo đơn hàng (CHỈ BANKER)

```
Banker assigns order → createOrder(orderData)
                        ↓
                  Supabase API
                        ↓
            Check user balance & quota
                        ↓
            Insert into orders table
                        ↓
        Update user order_quota_used, pending_orders
                        ↓
            Return order data
                        ↓
    User sees new order in OrdersScreen
```

### 6. Hoàn thành đơn hàng (CHỈ BANKER)

```
Banker completes order → completeOrder(orderId)
                            ↓
                      Supabase API
                            ↓
            Update order status = 'completed'
                            ↓
        Update user wallet_balance += commission
                            ↓
        Update user total_commission
                            ↓
        Update user pending_orders -= 1
                            ↓
        Insert transaction log
                            ↓
            Return success
                            ↓
    User sees updated balance & completed order
```

---

## 🔒 SECURITY

### 1. Row Level Security (RLS)

**Đã cấu hình:**
- Users chỉ đọc được dữ liệu của chính mình
- Cho phép public registration (INSERT)
- Users chỉ update được profile (không phải balance/quota)
- Orders chỉ visible với chủ sở hữu
- Products visible với tất cả

### 2. Authentication

**Hiện tại:**
- Password lưu plain text (❌ KHÔNG AN TOÀN)
- Session token được generate và lưu

**TODO:**
- ✅ Hash password với bcrypt trước khi lưu
- ✅ Implement JWT authentication
- ✅ Refresh token mechanism
- ✅ Rate limiting cho login attempts

### 3. Authorization

**Quyền hạn:**
- **User:** Chỉ đọc dữ liệu của mình, không thay đổi balance/quota
- **Banker/Admin:** Toàn quyền thay đổi mọi thứ (service_role key)

---

## 🔄 SYNC STRATEGY

### Real-time Updates (Optional - Nâng cao)

Supabase hỗ trợ realtime subscriptions:

```typescript
// Example: Subscribe to user changes
const subscription = supabase
  .channel('user_changes')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'users',
      filter: `uid=eq.${currentUserId}`,
    },
    (payload) => {
      console.log('User data updated:', payload.new);
      // Update app state với dữ liệu mới
    }
  )
  .subscribe();
```

### Polling Strategy (Đơn giản hơn)

```typescript
// Mỗi 30 giây, refresh user data
setInterval(async () => {
  const userData = await getUserByUid(currentUserId);
  if (userData) {
    updateAppState(userData);
  }
}, 30000);
```

---

## 📱 BACKWARD COMPATIBILITY

### localStorage Fallback

Để đảm bảo app vẫn hoạt động khi không có internet:

1. Mỗi lần fetch từ Supabase → sync to localStorage
2. Khi offline → đọc từ localStorage
3. Khi online lại → sync ngược lên Supabase

**Implemented in:** `supabaseApi.ts` → `syncUserToLocalStorage()`

---

## ⚙️ CONFIGURATION

### Environment Variables

```env
# Required
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...

# Optional
VITE_API_URL=http://localhost:3001/api
```

### Supabase Project Settings

1. **API Settings:**
   - Enable Public API
   - Copy anon/public key

2. **Database Settings:**
   - Enable Realtime (nếu cần)
   - Setup connection pooling

3. **Auth Settings:**
   - Disable Email Auth (nếu không dùng)
   - Customize Password Requirements

---

## 🧪 TESTING

### Test Đăng ký

```bash
# Trong browser console (F12)
```

```javascript
import { registerUser } from './supabaseApi';

const result = await registerUser({
  username: 'testuser001',
  password: 'Test@123',
  phone: '0123456789',
  email: 'test@example.com',
  fullName: 'Test User',
  authCode: 'AUTH2025001',
  withdrawalPassword: '123456'
});

console.log(result);
// { success: true, user: {...} }
```

### Test Đăng nhập

```javascript
import { loginUser } from './supabaseApi';

const result = await loginUser('testuser001', 'Test@123');
console.log(result);
// { success: true, user: {...} }
```

### Test Lấy orders

```javascript
import { getUserOrders } from './supabaseApi';

const orders = await getUserOrders(1); // uid = 1
console.log(orders);
// [{ orderId: '...', ... }]
```

---

## 📈 MONITORING

### Supabase Dashboard

1. **Table Editor:** Xem dữ liệu realtime
2. **SQL Editor:** Chạy queries để debug
3. **Logs:** Xem API calls và errors
4. **Database:** Monitor performance

### Browser Console

```javascript
// Enable debug logging
localStorage.setItem('DEBUG', 'true');

// Xem tất cả API calls
```

---

## 🚧 TODO - TÍCH HỢP TIẾP

### 1. HomeScreen.tsx - Products

```typescript
import { fetchProducts, fetchFeaturedProducts } from '../supabaseApi';

// Load products from Supabase
useEffect(() => {
  async function loadProducts() {
    const products = await fetchProducts();
    setProducts(products);
  }
  loadProducts();
}, []);
```

### 2. OrdersScreen.tsx - Orders List

```typescript
import { getUserOrders } from '../supabaseApi';

// Load user's orders
useEffect(() => {
  async function loadOrders() {
    const orders = await getUserOrders(currentUser.uid);
    setOrders(orders);
  }
  loadOrders();
}, [currentUser.uid]);
```

### 3. WalletScreen.tsx - Balance Display

```typescript
import { getUserByUid } from '../supabaseApi';

// Refresh user data để có balance mới nhất
useEffect(() => {
  async function refreshUserData() {
    const userData = await getUserByUid(currentUser.uid);
    if (userData) {
      setCurrentUser(userData);
    }
  }
  refreshUserData();
}, []);
```

### 4. ProfileScreen.tsx - Update Profile

```typescript
import { updateUser } from '../supabaseApi';

async function handleSaveProfile() {
  const result = await updateUser(currentUser.uid, {
    phone: phone,
    email: email,
    fullName: fullName,
  });
  
  if (result.success) {
    alert('✅ Cập nhật thành công!');
  } else {
    alert(`❌ Lỗi: ${result.error}`);
  }
}
```

---

## 📞 SUPPORT & TROUBLESHOOTING

### Lỗi thường gặp

1. **"Failed to fetch"**
   - Check VITE_SUPABASE_URL đúng chưa
   - Check internet connection
   - Check Supabase project có online không

2. **"Permission denied"**
   - Check RLS policies
   - Check anon key có đúng không
   - Thử dùng service_role key để bypass RLS (chỉ testing)

3. **"Table does not exist"**
   - Chạy lại các SQL create table
   - Check table names (lowercase, underscore)

4. **"Column does not exist"**
   - Check field names trong SQL vs TypeScript
   - Migration có chạy đủ chưa

### Debug Steps

1. Mở Supabase Dashboard → Logs
2. Xem request/response trong Network tab (F12)
3. Console.log result từ API calls
4. Check dữ liệu trong Table Editor

---

## 🎯 CHECKLIST SETUP

- [ ] Tạo Supabase project
- [ ] Chạy SQL tạo tables
- [ ] Insert auth_codes
- [ ] Insert sample products
- [ ] Setup RLS policies
- [ ] Tạo file .env với URL & keys
- [ ] Test đăng ký
- [ ] Test đăng nhập
- [ ] Tích hợp HomeScreen
- [ ] Tích hợp OrdersScreen
- [ ] Tích hợp WalletScreen
- [ ] Tích hợp ProfileScreen
- [ ] Test end-to-end flow
- [ ] Deploy to production

---

**Tài liệu liên quan:**
- `SUPABASE_SETUP.md` - Hướng dẫn setup database chi tiết
- `BACKEND_SPECIFICATION.md` - Specification về backend architecture
- `API-INTEGRATION.md` - Hướng dẫn tích hợp API cũ

**Last updated:** December 10, 2025
