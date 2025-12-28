// ⚠️ QUAN TRỌNG: THÔNG TIN SẢN PHẨM & ĐƠN HÀNG DO BACKEND QUẢN LÝ
// - Tất cả dữ liệu sản phẩm, giá trị, chiết khấu được backend phát xuống
// - Mọi quyền kiểm soát cửa hàng do backend/banker quản lý
// - Frontend chỉ hiển thị dữ liệu từ API, không tự tạo giá trị
// - Giá trị thay đổi theo thời gian thực từ backend

// Product type - Compatible with backend API response
// Backend sẽ trả về format:
// {
//   id: string | number,
//   name: string,              // Tên sản phẩm đầy đủ
//   price: number,              // Giá trị đơn hàng (VD: 3457.00)
//   imageUrl: string,           // URL ảnh sản phẩm
//   description?: string,       // Mô tả chi tiết sản phẩm
//   discountAmount?: number,    // Tiền chiết khấu (VD: 432.13)
//   discountPercent?: number,   // % chiết khấu
//   maxOrderQuantity?: string,  // Lượng đơn tối đa (VD: "X1")
//   createdAt?: string,         // Ngày tạo (VD: "2025-11-28 17:22:38")
//   stock?: number,
//   category?: string,
//   isFeatured?: boolean,
// }

export type Product = {
  id: string | number;
  name: string;
  price: number;
  imageUrl: string;
  description?: string;
  discountAmount?: number;        // Tiền chiết khấu thực tế
  discountPercent?: number;       // % chiết khấu
  maxOrderQuantity?: string;      // Lượng đơn tối đa
  createdAt?: string;             // Thời gian tạo
  stock?: number;
  category?: string;
  isFeatured?: boolean;
};

// MOCK DATA - CHỈ ĐỂ DEMO
// Trong production, dữ liệu này sẽ được lấy từ API backend:
// GET /api/products - Lấy danh sách sản phẩm từ backend
// Backend sẽ kiểm soát: giá, chiết khấu, tồn kho, trạng thái
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Apple Pencil Pro",
    price: 3435000,
    imageUrl: "/san-pham0.jpg",
    description: "Khắc Miễn Phí",
    stock: 12,
    category: "Phụ kiện",
    isFeatured: true,
    discountPercent: 0,
  },
  {
    id: 2,
    name: "AirTag",
    price: 785000,
    imageUrl: "/san-pham1.jpg",
    description: "Khắc Miễn Phí",
    stock: 34,
    category: "Phụ kiện",
    isFeatured: false,
    discountPercent: 0,
  },
  {
    id: 3,
    name: "Apple Pencil Pro",
    price: 3435000,
    imageUrl: "/san-pham2.jpg",
    description: "Khắc Miễn Phí",
    stock: 7,
    category: "Phụ kiện",
    isFeatured: true,
    discountPercent: 0,
  },
  {
    id: 4,
    name: "iPad mini",
    price: 14999000,
    imageUrl: "/sam-pham5.jpg",
    description: "Khắc Miễn Phí",
    stock: 15,
    category: "Máy tính bảng",
    isFeatured: false,
    discountPercent: 0,
  },
  {
    id: 5,
    name: "iPad mini",
    price: 13744000,
    imageUrl: "/san-pham6.jpg",
    description: "Từ 13.744.000đ",
    stock: 22,
    category: "Máy tính bảng",
    isFeatured: true,
    discountPercent: 0,
  },
];

export const formatCurrency = (value: number) =>
  // Format as USD with $ symbol
  "$" + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatUSDT = (value: number) =>
  // Format as USD with $ symbol
  "$" + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatVND = (value: number) =>
  // Format as VND with đ symbol (for products only)
  value.toLocaleString("vi-VN") + "đ";
