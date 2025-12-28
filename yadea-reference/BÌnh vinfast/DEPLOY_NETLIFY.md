# 🚀 HƯỚNG DẪN DEPLOY LÊN NETLIFY

## ✅ Build đã hoàn tất!

File build nằm trong thư mục: `dist/`

---

## 📝 CÁCH 1: Deploy qua Netlify Web (Khuyến nghị)

### Bước 1: Truy cập Netlify
1. Mở: https://app.netlify.com/
2. Đăng nhập (hoặc đăng ký miễn phí)

### Bước 2: Deploy thủ công
1. Click **"Add new site"** → **"Deploy manually"**
2. Kéo thả thư mục `dist/` vào khung upload
3. Chờ deploy hoàn tất (~30 giây)
4. Nhận link: `https://your-site-name.netlify.app`

### Bước 3: Cấu hình Environment Variables
1. Vào **Site settings** → **Environment variables**
2. Thêm 2 biến:
   ```
   Key: NEXT_PUBLIC_SUPABASE_URL
   Value: https://sjrmdmudpttfsdwqirab.supabase.co

   Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcm1kbXVkcHR0ZnNkd3FpcmFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5Nzc1OTksImV4cCI6MjA4MDU1MzU5OX0.1NZfQ-96FheYDm0i5Tf6g3cZTZw6vea7KTNQUZnBBbg
   ```
3. Click **"Save"**
4. **Redeploy site** để apply environment variables

---

## 📝 CÁCH 2: Deploy qua GitHub (Tự động CI/CD)

### Bước 1: Push code lên GitHub
```powershell
git init
git add .
git commit -m "Initial commit with Supabase integration"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/vinfast-wallet.git
git push -u origin main
```

### Bước 2: Connect với Netlify
1. Vào https://app.netlify.com/
2. Click **"Add new site"** → **"Import an existing project"**
3. Chọn **GitHub** → Authorize
4. Chọn repository `vinfast-wallet`
5. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Add environment variables (như Cách 1 - Bước 3)
7. Click **"Deploy site"**

---

## 🎯 SAU KHI DEPLOY:

### ✅ Kiểm tra các trang:
- Homepage: `https://your-site.netlify.app/`
- Wallet: `https://your-site.netlify.app/wallet`
- Banker: `https://your-site.netlify.app/banker`

### ✅ Test đồng bộ:
1. Tạo tài khoản trên Wallet (từ điện thoại)
2. Login Banker (từ laptop)
3. Kiểm tra user có hiện trong danh sách không
4. Nạp tiền → Duyệt → Kiểm tra số dư

---

## 🔧 Custom Domain (Tùy chọn):

1. Vào **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Nhập domain của bạn (ví dụ: `wallet.vinfast.com`)
4. Config DNS theo hướng dẫn
5. Enable HTTPS (tự động)

---

## 📊 KẾT QUẢ BUILD:

```
✓ Compiled successfully
✓ Linting passed
✓ Type checking passed
✓ Production build ready

Bundle size:
- Wallet: 153 kB
- Banker: 149 kB
- Total: ~302 kB

Status: READY TO DEPLOY! 🚀
```

---

## 💡 LƯU Ý:

1. **Environment variables PHẢI được add** trên Netlify để app hoạt động
2. Sau khi add env vars, nhớ **Redeploy** site
3. Netlify cung cấp:
   - ✅ Free SSL/HTTPS
   - ✅ CDN toàn cầu
   - ✅ Auto deploy khi push code
   - ✅ Custom domain support

---

## 🆘 Nếu gặp lỗi:

1. **404 Not Found:** Kiểm tra file `netlify.toml` đã được tạo
2. **Supabase connection error:** Kiểm tra environment variables
3. **Build failed:** Chạy lại `npm run build` để test local

---

🎉 **Chúc mừng! App đã sẵn sàng deploy!**
