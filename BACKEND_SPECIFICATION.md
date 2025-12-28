# 🔥 HỆ THỐNG SCLM - BACKEND SPECIFICATION

> **Quy tắc vàng:** Backend (Banker) quyết định - App hiển thị  
> Toàn bộ tài khoản, đơn hàng, chiết khấu, số dư và quota đều phải đồng bộ theo hậu đài.  
> **App TUYỆT ĐỐI KHÔNG tự sinh bất kỳ dữ liệu nào.**

---

## 📋 MỤC LỤC

1. [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
2. [Đồng bộ tài khoản](#1-đồng-bộ-tài-khoản-giữa-app--hậu-đài)
3. [Luồng lấy thông tin tài khoản](#2-luồng-lấy-thông-tin-tài-khoản-từ-hậu-đài)
4. [Cơ chế phân đơn](#3-cơ-chế-phân-đơn-từ-hậu-đài-xuống-app)
5. [Xử lý đơn hàng](#4-xử-lý-đơn-khi-user-nhấn-gửi-đơn-hàng)
6. [Xử lý số dư không đủ](#5-xử-lý-trường-hợp-vượt-số-dư)
7. [Quy tắc cho Dev Team](#6-quy-tắc-vàng-cho-dev-team)

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

```
┌─────────────────────────────────────────────────────────┐
│                   BANKER DASHBOARD                       │
│              (Backend / Hậu đài / Admin)                 │
│                                                          │
│  • Quản lý tài khoản (VIP, số dư, quota)                │
│  • Phân phối đơn hàng                                    │
│  • Tính toán hoa hồng                                    │
│  • Duyệt nạp/rút tiền                                    │
│  • NGUỒN DỮ LIỆU GỐC - Quyết định mọi thứ               │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ localStorage / API
                 │ (Đồng bộ 100%)
                 ↓
┌─────────────────────────────────────────────────────────┐
│                        APP                               │
│                   (User Frontend)                        │
│                                                          │
│  • CHỈ HIỂN THỊ dữ liệu từ Backend                      │
│  • KHÔNG tự tính commission, quota, VIP                  │
│  • KHÔNG quyền thay đổi số dư                            │
│  • Gửi request lên Backend khi user thao tác             │
└─────────────────────────────────────────────────────────┘
```

---

## 1. ĐỒNG BỘ TÀI KHOẢN GIỮA APP ↔ HẬU ĐÀI

### 📦 Data Structure (User Model)

Toàn bộ tài khoản được tạo từ ứng dụng (App) phải được đồng bộ lên hậu đài theo cấu trúc:

```typescript
{
  "uid": number,                   // ID người dùng (primary key)
  "username": string,              // Tên đăng nhập
  "phone": string,                 // Số điện thoại
  "email": string,                 // Email
  "fullName": string,              // Họ tên đầy đủ
  
  // ⚠️ CÁC FIELD QUAN TRỌNG - CHỈ BANKER QUẢN LÝ
  "walletBalance": number,         // Số dư ví
  "vipLevel": string,              // Cấp VIP (VIP1, VIP2, VIP3...)
  "orderQuotaMax": number,         // Số đơn tối đa được phép nhận
  "orderQuotaUsed": number,        // Số đơn đã sử dụng
  "pendingOrders": number,         // Số đơn chưa giải quyết
  "totalCommission": number,       // Tổng chiết khấu đã kiếm
  
  "creditScore": number,           // Điểm tín dụng
  "status": "active" | "inactive" | "suspended", // Trạng thái
  "registerTime": string,          // Thời gian đăng ký (ISO 8601)
  "authCode": string,              // Mã ủy quyền
  "withdrawalPassword": string     // Mật khẩu rút tiền
}
```

### 🔑 Các trường quan trọng

| Field | Mô tả | Quyền kiểm soát |
|-------|-------|-----------------|
| `walletBalance` | Số dư ví hiện tại | ✅ CHỈ BANKER |
| `vipLevel` | Cấp VIP (quyết định hoa hồng) | ✅ CHỈ BANKER |
| `orderQuotaMax` | Số đơn tối đa/ngày | ✅ CHỈ BANKER |
| `orderQuotaUsed` | Số đơn đã nhận | ✅ CHỈ BANKER |
| `pendingOrders` | Đơn chưa xử lý | ✅ CHỈ BANKER |
| `totalCommission` | Tổng hoa hồng | ✅ CHỈ BANKER |
| `status` | Trạng thái tài khoản | ✅ CHỈ BANKER |

### 📝 Quy tắc đồng bộ

1. **Hậu đài là nguồn dữ liệu gốc**
   - Mọi thay đổi từ Banker → App phải cập nhật ngay lập tức
   - App chỉ đọc dữ liệu, không được tự thay đổi

2. **Khi App mở/refresh:**
   - App phải gọi API để lấy dữ liệu mới nhất
   - Không cache dữ liệu cũ quá 2 giây

3. **Khi Banker thay đổi:**
   - Lưu vào localStorage/Database
   - App tự động sync trong vòng 2 giây

---

## 2. LUỒNG LẤY THÔNG TIN TÀI KHOẢN TỪ HẬU ĐÀI

### 🔄 Khi nào App phải gọi API?

App phải luôn gọi API khi:
- ✅ Mở tab "Đặt hàng" (Orders)
- ✅ Mở tab "Trang chủ" (Home)
- ✅ Mở tab "Ví" (Wallet)
- ✅ Sau khi hoàn thành đơn hàng
- ✅ Mỗi 2 giây (auto-refresh)

### 📡 API Endpoint

```http
GET /api/user/info?uid={userId}
```

**Request Headers:**
```http
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "uid": 12345,
    "username": "user123",
    "fullName": "Nguyễn Văn A",
    "phone": "0909123456",
    "email": "user@example.com",
    "walletBalance": 50000,        // Số dư hiện tại
    "vipLevel": "VIP2",            // Cấp VIP
    "orderQuotaMax": 50,           // Số đơn tối đa
    "orderQuotaUsed": 12,          // Đã nhận 12 đơn
    "pendingOrders": 3,            // 3 đơn chưa xử lý
    "totalCommission": 1250.50,    // Tổng hoa hồng: 1,250.50
    "creditScore": 85,
    "status": "active",
    "registerTime": "2024-12-01T10:30:00Z"
  }
}
```

### 🖥️ App hiển thị

App nhận response và hiển thị **CHÍNH XÁC 100%** theo dữ liệu:

```typescript
// ❌ SAI - KHÔNG được tự tính
const commission = orderValue * 0.05;

// ✅ ĐÚNG - Hiển thị từ backend
const commission = userData.totalCommission;

// ❌ SAI - KHÔNG được cache cứng
const balance = 12345;

// ✅ ĐÚNG - Luôn lấy từ API
const balance = userData.walletBalance;
```

---

## 3. CƠ CHẾ PHÂN ĐƠN TỪ HẬU ĐÀI XUỐNG APP

### 🎯 Banker đặt tham số phân đơn

Trên Banker Dashboard, admin sẽ cài đặt:

| Tham số | Mô tả | Ví dụ |
|---------|-------|-------|
| **Ngày tiêm** | Ngày phân phối đơn | `2024-12-04` |
| **Phạm vi tiêm** | User hoặc VIP level | `VIP2` hoặc `uid:12345` |
| **Tỷ lệ hoa hồng** | % commission | `5%` hoặc `8%` |
| **Quota số đơn** | Số đơn tối đa/user | `50 đơn/ngày` |
| **Trạng thái** | Active/Inactive | `active` |

Khi Banker bấm **"Nộp"**, hệ thống ghi lệnh vào DB phân đơn.

### 📡 API: Lấy đơn tiếp theo

Khi user nhấn **"Bắt đầu lấy đơn hàng"**, App gọi:

```http
GET /api/orders/next?uid={userId}
```

**Response (200 OK) - Có đơn:**
```json
{
  "success": true,
  "data": {
    "orderId": "ORD-20241204-00123",
    "createdAt": "2024-12-04T14:30:00Z",
    "productName": "iPhone 15 Pro Max 256GB",
    "productImage": "https://cdn.example.com/iphone15.jpg",
    "orderAmount": 28990000,        // Giá trị đơn: 28,990,000 VNĐ
    "commission": 1449500,          // Hoa hồng: 1,449,500 VNĐ (5%)
    "requiredBalance": 28990000,    // Số dư yêu cầu
    "vipLevel": "VIP2"
  }
}
```

**Response (404 Not Found) - Không có đơn:**
```json
{
  "success": false,
  "message": "Hiện chưa nhận được phân phối",
  "code": "NO_ORDERS_AVAILABLE"
}
```

**Response (403 Forbidden) - Vượt quota:**
```json
{
  "success": false,
  "message": "Đã đạt giới hạn số đơn hôm nay",
  "data": {
    "orderQuotaMax": 50,
    "orderQuotaUsed": 50
  }
}
```

### 🖥️ App xử lý

```typescript
// App CHỈ nhận và hiển thị
const response = await fetch(`/api/orders/next?uid=${userId}`);
const data = await response.json();

if (data.success) {
  // Hiển thị đơn hàng
  showOrder(data.data);
} else {
  // Hiển thị thông báo lỗi
  showToast(data.message);
}
```

---

## 4. XỬ LÝ ĐơN KHI USER NHẤN "GỬI ĐƠN HÀNG"

### 📡 API: Xác nhận đơn hàng

```http
POST /api/orders/confirm
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "uid": 12345,
  "orderId": "ORD-20241204-00123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Đơn hàng đã được xác nhận",
  "data": {
    "orderId": "ORD-20241204-00123",
    "status": "completed",
    "commission": 1449500,
    "newBalance": 50000,              // Số dư mới
    "orderQuotaUsed": 13,             // Đã dùng 13/50 đơn
    "remainingOrders": 37,            // Còn lại 37 đơn
    "totalCommission": 2700000        // Tổng hoa hồng mới
  }
}
```

### ⚙️ Backend phải thực hiện

Khi nhận request confirm order, Backend **BẮT BUỘC** thực hiện:

```typescript
// 1. Cập nhật quota
user.orderQuotaUsed += 1;
user.remainingOrders = user.orderQuotaMax - user.orderQuotaUsed;

// 2. Cập nhật commission
user.totalCommission += order.commission;

// 3. Cập nhật trạng thái đơn
order.status = "completed";
order.completionTime = new Date().toISOString();

// 4. KHÔNG trừ số dư ví
// user.walletBalance -= order.orderAmount; // ❌ KHÔNG LÀM

// 5. Giảm pending orders
user.pendingOrders -= 1;

// 6. Lưu vào database
await saveUser(user);
await saveOrder(order);
```

### 🖥️ App cập nhật UI

```typescript
const result = await confirmOrder(uid, orderId);

if (result.success) {
  // Cập nhật UI với dữ liệu từ backend
  setBalance(result.data.newBalance);
  setTotalCommission(result.data.totalCommission);
  setOrderQuotaUsed(result.data.orderQuotaUsed);
  
  showToast('✅ Đơn hàng đã hoàn thành!');
}
```

---

## 5. XỬ LÝ TRƯỜNG HỢP VƯỢT SỐ DƯ

### ⚠️ Quy tắc quan trọng

**Nếu `requiredBalance > walletBalance`:**
- ✅ App vẫn hiển thị đơn hàng
- ✅ App hiển thị cảnh báo
- ✅ App VẪN CHO PHÉP nhấn "Gửi đơn hàng"
- ✅ **Quyết định phân đơn thuộc về Banker, không phải App**

### 📡 API Response

```json
{
  "success": true,
  "data": {
    "orderId": "ORD-20241204-00124",
    "orderAmount": 50000000,
    "requiredBalance": 50000000,
    "commission": 2500000
  },
  "warning": "insufficient_balance",  // ⚠️ Cảnh báo
  "warningMessage": "Số dư khả dụng không đủ"
}
```

### 🖥️ App hiển thị

```typescript
if (orderData.warning === "insufficient_balance") {
  // Hiển thị cảnh báo màu vàng
  showWarning(`
    ⚠️ Số dư khả dụng không đủ
    Yêu cầu: ${formatCurrency(orderData.requiredBalance)}
    Số dư hiện tại: ${formatCurrency(walletBalance)}
  `);
  
  // ✅ VẪN CHO PHÉP nhấn nút "Gửi đơn hàng"
  setSubmitButtonEnabled(true);
}
```

---

## 6. QUY TẮC VÀNG CHO DEV TEAM

### 👨‍💻 FRONTEND (App) - QUY TẮC

#### ❌ TUYỆT ĐỐI KHÔNG ĐƯỢC:

1. ❌ Tự tính sản phẩm, giá đơn, chiết khấu
```typescript
// ❌ SAI
const commission = orderAmount * 0.05;
```

2. ❌ Tự tăng/giảm số dư
```typescript
// ❌ SAI
setBalance(balance - orderAmount);
```

3. ❌ Tự quyết định quota
```typescript
// ❌ SAI
if (ordersToday >= 50) return;
```

4. ❌ Tự đổi VIP level
```typescript
// ❌ SAI
if (totalOrders > 100) setVipLevel("VIP2");
```

5. ❌ Cache dữ liệu lâu hơn 2 giây
```typescript
// ❌ SAI
const cachedBalance = localStorage.getItem('balance');
```

#### ✅ BẮT BUỘC PHẢI:

1. ✅ Luôn gọi API lấy dữ liệu mới
```typescript
// ✅ ĐÚNG
const userData = await fetchUserInfo(uid);
setBalance(userData.walletBalance);
```

2. ✅ Hiển thị chính xác 100% dữ liệu từ backend
```typescript
// ✅ ĐÚNG
<div>Số dư: {formatCurrency(userData.walletBalance)}</div>
<div>Hoa hồng: {formatCurrency(userData.totalCommission)}</div>
```

3. ✅ Gửi request lên backend khi user thao tác
```typescript
// ✅ ĐÚNG
const result = await confirmOrder(uid, orderId);
updateUIWithBackendData(result.data);
```

4. ✅ Hiển thị warning nhưng VẪN cho phép thao tác
```typescript
// ✅ ĐÚNG
if (requiredBalance > walletBalance) {
  showWarning('Số dư không đủ');
  // Vẫn cho phép gửi đơn
}
```

### 🔧 BACKEND (Banker) - QUY TẮC

#### ✅ BACKEND QUYẾT ĐỊNH:

1. ✅ Số đơn tối đa (quota)
2. ✅ Tỷ lệ hoa hồng
3. ✅ Sản phẩm phân phối
4. ✅ Giá trị đơn hàng
5. ✅ Số dư yêu cầu
6. ✅ VIP level
7. ✅ Trạng thái tài khoản

#### ✅ BACKEND PHẢI ĐẢM BẢO:

1. ✅ Mọi số liệu phải khớp 100% giữa DB và API response
2. ✅ Tính toán chính xác: quota used, pending orders, total commission
3. ✅ Validate mọi request từ App
4. ✅ Log mọi thao tác quan trọng
5. ✅ Đồng bộ realtime với App trong vòng 2 giây

---

## 📊 FLOWCHART TỔNG QUAN

```
┌──────────────────────────────────────────────────────────────┐
│                    USER MỞ APP                                │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ↓
┌──────────────────────────────────────────────────────────────┐
│          App gọi: GET /api/user/info?uid={uid}               │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ↓
┌──────────────────────────────────────────────────────────────┐
│  Backend trả về:                                             │
│  • walletBalance                                             │
│  • vipLevel                                                  │
│  • orderQuotaMax / orderQuotaUsed                            │
│  • totalCommission                                           │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ↓
┌──────────────────────────────────────────────────────────────┐
│          App HIỂN THỊ CHÍNH XÁC 100%                         │
└──────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────┐
│         USER NHẤN "BẮT ĐẦU LẤY ĐƠN HÀNG"                     │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ↓
┌──────────────────────────────────────────────────────────────┐
│          App gọi: GET /api/orders/next?uid={uid}             │
└────────────────────────┬─────────────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
              ↓                     ↓
    ┌─────────────────┐   ┌─────────────────┐
    │   Có đơn        │   │  Không có đơn   │
    │                 │   │                 │
    │ Backend trả:    │   │ Backend trả:    │
    │ • orderId       │   │ • message:      │
    │ • productName   │   │   "Hiện chưa    │
    │ • orderAmount   │   │   nhận được     │
    │ • commission    │   │   phân phối"    │
    │ • requiredBalance│   │                 │
    └────────┬────────┘   └────────┬────────┘
             │                     │
             ↓                     ↓
    ┌─────────────────┐   ┌─────────────────┐
    │ App hiển thị    │   │ App hiển thị    │
    │ đơn hàng        │   │ thông báo       │
    └────────┬────────┘   └─────────────────┘
             │
             ↓
    ┌─────────────────┐
    │ Check số dư?    │
    └────────┬────────┘
             │
    ┌────────┴────────┐
    │                 │
    ↓                 ↓
┌──────────┐   ┌──────────┐
│ Đủ số dư │   │ Thiếu $  │
└────┬─────┘   └────┬─────┘
     │              │
     │              ↓
     │     ┌─────────────────┐
     │     │ Hiển thị cảnh   │
     │     │ báo màu vàng    │
     │     └────┬────────────┘
     │          │
     └──────────┴──────────┐
                           │
                           ↓
              ┌────────────────────────┐
              │ VẪN CHO PHÉP nhấn      │
              │ "Gửi đơn hàng"         │
              └────────────┬───────────┘
                           │
                           ↓
              ┌────────────────────────┐
              │ USER NHẤN "GỬI ĐƠN"    │
              └────────────┬───────────┘
                           │
                           ↓
              ┌────────────────────────────────────┐
              │ App gọi:                           │
              │ POST /api/orders/confirm           │
              │ { uid, orderId }                   │
              └────────────┬───────────────────────┘
                           │
                           ↓
              ┌────────────────────────────────────┐
              │ Backend xử lý:                     │
              │ 1. orderQuotaUsed += 1             │
              │ 2. totalCommission += commission   │
              │ 3. order.status = "completed"      │
              │ 4. KHÔNG trừ walletBalance         │
              └────────────┬───────────────────────┘
                           │
                           ↓
              ┌────────────────────────────────────┐
              │ App cập nhật UI với dữ liệu mới    │
              │ từ Backend response                │
              └────────────────────────────────────┘
```

---

## 🚨 CHECKLIST CHO DEV TEAM

### ✅ Frontend Developer

- [ ] App GỌI API `/api/user/info` mỗi khi mở tab Home/Wallet/Orders
- [ ] App GỌI API `/api/orders/next` khi user nhấn "Bắt đầu lấy đơn"
- [ ] App GỌI API `/api/orders/confirm` khi user nhấn "Gửi đơn hàng"
- [ ] App HIỂN THỊ 100% dữ liệu từ backend, không tự tính
- [ ] App KHÔNG cache số dư, commission, quota
- [ ] App HIỂN THỊ warning khi thiếu số dư nhưng VẪN cho phép gửi đơn
- [ ] App CẬP NHẬT UI ngay sau khi nhận response từ backend
- [ ] App XỬ LÝ mọi error case (401, 403, 404, 500)

### ✅ Backend Developer

- [ ] Endpoint `/api/user/info` trả về đầy đủ 15 fields theo spec
- [ ] Endpoint `/api/orders/next` kiểm tra quota trước khi trả đơn
- [ ] Endpoint `/api/orders/confirm` cập nhật đúng 5 bước (quota, commission, status, không trừ tiền, pending)
- [ ] Backend VALIDATE mọi request (uid, orderId, token)
- [ ] Backend TÍNH TOÁN chính xác: remainingOrders = quotaMax - quotaUsed
- [ ] Backend LOG mọi transaction quan trọng
- [ ] Backend ĐẢM BẢO data consistency giữa DB và API
- [ ] Backend TRẢ VỀ warning khi requiredBalance > walletBalance

### ✅ Banker Admin

- [ ] Đặt quota số đơn cho từng VIP level
- [ ] Đặt tỷ lệ hoa hồng chính xác
- [ ] Phân phối đơn hàng với giá trị và requiredBalance hợp lý
- [ ] Kiểm tra logs khi có vấn đề
- [ ] Duyệt/từ chối nạp rút tiền kịp thời

---

## 📞 HỖ TRỢ & LIÊN HỆ

Nếu có thắc mắc về spec này, liên hệ:
- **Tech Lead:** [Tên]
- **Backend Team:** [Email/Slack]
- **Frontend Team:** [Email/Slack]

---

**📅 Phiên bản:** 1.0.0  
**📅 Ngày cập nhật:** 2024-12-04  
**👤 Người tạo:** SCLM Development Team
