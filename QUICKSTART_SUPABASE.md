# 🔥 SUPABASE ĐỒNG BỘ HOÀN TOÀN - HƯỚNG DẪN NHANH

## ✅ Đã hoàn thành

Hệ thống đã được tích hợp **HOÀN TOÀN** với Supabase backend. Tất cả tài khoản, đơn hàng, số dư đều được đồng bộ với hậu đài.

---

## 🚀 3 BƯỚC ĐỂ BẮT ĐẦU

### Bước 1: Tạo Supabase Project (5 phút)

1. Truy cập: **https://supabase.com**
2. Đăng ký/Đăng nhập
3. Tạo project mới (chọn region gần nhất)
4. Chờ project khởi tạo xong

### Bước 2: Setup Database (2 phút)

1. Vào **SQL Editor** trong Supabase Dashboard
2. Copy toàn bộ nội dung file `supabase_setup.sql`
3. Paste vào SQL Editor
4. Click **Run** để tạo toàn bộ tables

### Bước 3: Cấu hình App (1 phút)

1. Vào **Project Settings** > **API**
2. Copy:
   - `Project URL` (ví dụ: `https://xxx.supabase.co`)
   - `anon/public key`

3. Tạo file `.env` trong thư mục `preview-app/`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Restart dev server:

```bash
npm run dev
```

**XONG!** 🎉

---

## 🧪 Test thử

1. Mở app: **http://localhost:5173**
2. Đăng ký tài khoản mới:
   - Username: `testuser`
   - Password: `Test123`
   - Mã ủy quyền: `AUTH2025001`
   - Điền các thông tin khác
3. Đăng nhập với tài khoản vừa tạo
4. Check dữ liệu trong Supabase Dashboard → **Table Editor** → `users`

---

## 📚 Tài liệu chi tiết

- **`SUPABASE_SETUP.md`** - Hướng dẫn setup database chi tiết
- **`FULL_SYNC_GUIDE.md`** - Architecture và integration
- **`SYNC_SUMMARY.md`** - Tổng hợp toàn bộ
- **`supabase_setup.sql`** - SQL script tạo database

---

## ❓ Troubleshooting

### Lỗi: "Failed to fetch"
- Check URL Supabase có đúng không
- Check API key có đúng không  
- Restart dev server

### Lỗi: "Table does not exist"
- Chạy lại file `supabase_setup.sql`
- Check trong Table Editor xem tables đã tạo chưa

### Lỗi: "Username đã tồn tại"
- Dùng username khác
- Hoặc xóa user cũ trong Table Editor

---

## 📊 Database có gì?

- **users** - 0 users (sẽ có sau khi đăng ký)
- **orders** - 0 orders  
- **products** - 5 sample products
- **transactions** - 0 transactions
- **auth_codes** - 10 codes (AUTH2025001 → AUTH2025010)

---

## 🎯 Điều gì xảy ra khi đăng ký?

```
1. User điền form → RegisterScreen.tsx
2. App gọi registerUser() → supabaseApi.ts
3. Supabase insert vào users table
4. Supabase đánh dấu auth_code đã dùng
5. Trả về user data
6. Đăng nhập tự động ✅
```

---

## 💡 Tips

- Mỗi mã ủy quyền chỉ dùng được **1 lần**
- Check Supabase Dashboard → **Logs** nếu có lỗi
- Dữ liệu cũng sync sang localStorage (backward compatible)
- Banker có full quyền thay đổi balance, quota

---

**Ready to go!** 🚀

Mọi thứ đã được đồng bộ lên Supabase - chỉ cần setup database là xong!
