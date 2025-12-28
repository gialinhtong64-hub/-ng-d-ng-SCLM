export type TabKey = "home" | "wallet" | "orders" | "profile";

// 🔥 HỆ THỐNG SCLM - BACKEND QUYẾT ĐỊNH, APP HIỂN THỊ
// Toàn bộ dữ liệu tài khoản, đơn hàng, chiết khấu, số dư và quota
// đều phải đồng bộ theo Banker (Backend/Hậu đài).
// App TUYỆT ĐỐI KHÔNG tự sinh dữ liệu.

export type User = {
  user_id: number;                // ID người dùng (chuẩn mới)
  username: string;               // Tên đăng nhập
  password?: string;              // Mật khẩu (chỉ dùng khi đăng ký/đăng nhập)
  phone: string;                  // Số điện thoại
  email: string;                  // Email
  fullName?: string;              // Họ tên đầy đủ
  walletBalance: number;          // Số dư ví - BANKER QUẢN LÝ
  vipLevel: string;               // Cấp VIP - BANKER QUẢN LÝ
  orderQuotaMax: number;          // Số đơn tối đa được nhận - BANKER ĐẶT
  orderQuotaUsed: number;         // Số đơn đã sử dụng - BANKER TÍNH
  pendingOrders: number;          // Số đơn chưa giải quyết - BANKER TÍNH
  totalCommission: number;        // Tổng chiết khấu - BANKER TÍNH
  creditScore?: number;           // Điểm tín dụng
  registerTime: string;           // Thời gian đăng ký
  status: "active" | "inactive" | "suspended"; // Trạng thái - BANKER QUẢN LÝ
  authCode?: string;              // Mã ủy quyền
  withdrawalPassword?: string;    // Mật khẩu rút tiền
  sessionToken?: string;          // Session token - quản lý đăng nhập
  lastLoginTime?: string;         // Thời gian đăng nhập gần nhất
};

export type Order = {
  orderId: string;                // ID đơn hàng
  user_id: number;                // ID người dùng (chuẩn mới)
  username: string;               // Tên người dùng
  productName: string;            // Tên sản phẩm
  productImage?: string;          // Hình ảnh sản phẩm
  orderAmount: number;            // Giá trị đơn hàng
  commission: number;             // Hoa hồng - BANKER ĐẶT
  requiredBalance: number;        // Số dư yêu cầu - BANKER ĐẶT
  createdAt: string;              // Thời gian tạo đơn
  completionTime?: string;        // Thời gian hoàn thành
  status: "pending" | "completed" | "processing"; // Trạng thái
  vipLevel: string;               // VIP level khi đặt đơn
};
