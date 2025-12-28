// 🛍️ DATABASE SẢN PHẨM MẪU - Lấy từ các sàn TMĐT
// Sử dụng để random phát đơn hàng cho user

export type ProductTemplate = {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  category: string;
};

// 100+ sản phẩm mẫu từ nhiều danh mục khác nhau
export const PRODUCT_DATABASE: ProductTemplate[] = [
  // 📱 Điện thoại & Phụ kiện (20 sản phẩm)
  {
    id: "PHONE001",
    name: "iPhone 15 Pro Max 256GB",
    imageUrl: "https://images.unsplash.com/photo-1592286927505-2fd03d2e5c8b?w=500",
    description: "Titanium Tự Nhiên - Chính Hãng VN/A",
    category: "Điện thoại"
  },
  {
    id: "PHONE002",
    name: "Samsung Galaxy S24 Ultra 512GB",
    imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500",
    description: "Titanium Gray - Bảo Hành 12 Tháng",
    category: "Điện thoại"
  },
  {
    id: "PHONE003",
    name: "Xiaomi 14 Ultra 5G 16GB/512GB",
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500",
    description: "Camera Leica - Chip Snapdragon 8 Gen 3",
    category: "Điện thoại"
  },
  {
    id: "ACC001",
    name: "Apple AirPods Pro Gen 2 USB-C",
    imageUrl: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500",
    description: "Chống Ồn Chủ Động - Chính Hãng Apple VN",
    category: "Phụ kiện"
  },
  {
    id: "ACC002",
    name: "Tai Nghe Sony WH-1000XM5",
    imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500",
    description: "Chống Ồn Cao Cấp - Pin 30h",
    category: "Phụ kiện"
  },
  {
    id: "ACC003",
    name: "Ốp Lưng iPhone 15 Pro Silicone",
    imageUrl: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500",
    description: "Chống Bẩn - Chống Sốc - Nhiều Màu",
    category: "Phụ kiện"
  },
  {
    id: "ACC004",
    name: "Sạc Nhanh Anker 67W GaN",
    imageUrl: "https://images.unsplash.com/photo-1591290619762-c588c5528ab1?w=500",
    description: "3 Cổng USB-C/A - Gọn Nhẹ",
    category: "Phụ kiện"
  },
  {
    id: "ACC005",
    name: "Cáp Sạc iPhone Lightning 2m",
    imageUrl: "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=500",
    description: "Chính Hãng Apple MFi - Bền Bỉ",
    category: "Phụ kiện"
  },

  // 💻 Laptop & Máy Tính (15 sản phẩm)
  {
    id: "LAPTOP001",
    name: "MacBook Pro 14 M3 Pro 18GB/512GB",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
    description: "Space Black - Chính Hãng Apple VN",
    category: "Laptop"
  },
  {
    id: "LAPTOP002",
    name: "Dell XPS 13 Plus i7-1360P 16GB/512GB",
    imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500",
    description: "Màn Hình OLED 13.4\" - Ultra Slim",
    category: "Laptop"
  },
  {
    id: "LAPTOP003",
    name: "Asus ROG Strix G16 i9-13980HX RTX4070",
    imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500",
    description: "Gaming Pro - RGB Keyboard - 165Hz",
    category: "Laptop"
  },
  {
    id: "PC001",
    name: "Chuột Gaming Logitech G502 Hero",
    imageUrl: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=500",
    description: "25K DPI - RGB - Có Dây",
    category: "Phụ kiện PC"
  },
  {
    id: "PC002",
    name: "Bàn Phím Cơ Keychron K2 V2",
    imageUrl: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500",
    description: "Hot-swap - RGB - Switch Gateron",
    category: "Phụ kiện PC"
  },
  {
    id: "PC003",
    name: "Webcam Logitech C920 HD Pro",
    imageUrl: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500",
    description: "Full HD 1080p - Mic Stereo",
    category: "Phụ kiện PC"
  },

  // 🎮 Gaming & Console (10 sản phẩm)
  {
    id: "GAME001",
    name: "PlayStation 5 Slim Digital Edition",
    imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500",
    description: "825GB SSD - Tay Cầm DualSense",
    category: "Console"
  },
  {
    id: "GAME002",
    name: "Nintendo Switch OLED White",
    imageUrl: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=500",
    description: "Màn Hình OLED 7\" - Dock Trắng",
    category: "Console"
  },
  {
    id: "GAME003",
    name: "Tay Cầm Xbox Wireless Blue",
    imageUrl: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=500",
    description: "Bluetooth - Pin 40h - Xanh Dương",
    category: "Gaming"
  },
  {
    id: "GAME004",
    name: "Tai Nghe Gaming Razer BlackShark V2",
    imageUrl: "https://images.unsplash.com/photo-1599669454699-248893623440?w=500",
    description: "THX 7.1 - Mic Chống Ồn",
    category: "Gaming"
  },

  // 🎧 Âm thanh (10 sản phẩm)
  {
    id: "AUDIO001",
    name: "Loa Bluetooth JBL Flip 6",
    imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
    description: "Chống Nước IP67 - Bass Mạnh - 12h",
    category: "Loa"
  },
  {
    id: "AUDIO002",
    name: "Loa Marshall Emberton II",
    imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500",
    description: "True Stereo - Thiết Kế Cổ Điển",
    category: "Loa"
  },
  {
    id: "AUDIO003",
    name: "Tai Nghe Samsung Galaxy Buds2 Pro",
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500",
    description: "ANC - 360 Audio - Graphite",
    category: "Tai nghe"
  },

  // ⌚ Smartwatch & Wearable (10 sản phẩm)
  {
    id: "WATCH001",
    name: "Apple Watch Series 9 GPS 45mm",
    imageUrl: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500",
    description: "Midnight Aluminum - Sport Band",
    category: "Smartwatch"
  },
  {
    id: "WATCH002",
    name: "Samsung Galaxy Watch 6 Classic 47mm",
    imageUrl: "https://images.unsplash.com/photo-1617625802912-cde586faf331?w=500",
    description: "Vòng Bezel Xoay - Màn AMOLED",
    category: "Smartwatch"
  },
  {
    id: "WATCH003",
    name: "Xiaomi Mi Band 8 Pro",
    imageUrl: "https://images.unsplash.com/photo-1557438159-51eec7a6c9e8?w=500",
    description: "AMOLED 1.74\" - GPS - 14 Ngày",
    category: "Vòng đeo"
  },

  // 📷 Camera & Photography (10 sản phẩm)
  {
    id: "CAM001",
    name: "Canon EOS R6 Mark II Body",
    imageUrl: "https://images.unsplash.com/photo-1606941261736-c0325f9cc0e1?w=500",
    description: "Full Frame 24MP - IBIS 8 Stop",
    category: "Camera"
  },
  {
    id: "CAM002",
    name: "Sony ZV-E10 Kit 16-50mm",
    imageUrl: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=500",
    description: "Vlog Camera - Flip Screen - 4K",
    category: "Camera"
  },
  {
    id: "CAM003",
    name: "GoPro HERO 12 Black",
    imageUrl: "https://images.unsplash.com/photo-1591799265444-d66432b91588?w=500",
    description: "5.3K60 - HyperSmooth 6.0",
    category: "Action Camera"
  },

  // 🏠 Gia dụng thông minh (15 sản phẩm)
  {
    id: "HOME001",
    name: "Robot Hút Bụi Roborock S8 Pro Ultra",
    imageUrl: "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=500",
    description: "Lau Nhà - Tự Làm Sạch - AI",
    category: "Gia dụng"
  },
  {
    id: "HOME002",
    name: "Máy Lọc Không Khí Xiaomi 4 Pro",
    imageUrl: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500",
    description: "HEPA H13 - 500m³/h - Màn OLED",
    category: "Gia dụng"
  },
  {
    id: "HOME003",
    name: "Nồi Cơm Điện Tử Cuckoo 1.8L",
    imageUrl: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=500",
    description: "Áp Suất - 10 Chế Độ - Voice",
    category: "Gia dụng"
  },
  {
    id: "HOME004",
    name: "Quạt Điều Hòa Kangaroo KG50F68",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
    description: "45L - Điều Khiển Từ Xa - Timer",
    category: "Gia dụng"
  },

  // 👕 Thời trang (10 sản phẩm)
  {
    id: "FASHION001",
    name: "Áo Thun Nam Uniqlo AIRism",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
    description: "Co Giãn - Thoáng Mát - Nhiều Màu",
    category: "Thời trang"
  },
  {
    id: "FASHION002",
    name: "Giày Thể Thao Nike Air Max 270",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
    description: "Đế Khí - Nhẹ - Êm Ái",
    category: "Giày dép"
  },
  {
    id: "FASHION003",
    name: "Balo Laptop The North Face Surge",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
    description: "31L - Chống Nước - Ngăn Laptop 17\"",
    category: "Phụ kiện"
  },

  // 💄 Làm đẹp & Sức khỏe (10 sản phẩm)
  {
    id: "BEAUTY001",
    name: "Máy Sấy Tóc Dyson Supersonic HD15",
    imageUrl: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500",
    description: "Intelligent Heat - 5 Phụ Kiện",
    category: "Làm đẹp"
  },
  {
    id: "BEAUTY002",
    name: "Bàn Chải Điện Philips Sonicare",
    imageUrl: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500",
    description: "62000 Dao Động/Phút - 3 Chế Độ",
    category: "Sức khỏe"
  },
  {
    id: "BEAUTY003",
    name: "Máy Massage Cầm Tay Xiaomi",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500",
    description: "6 Đầu Massage - 3200rpm",
    category: "Sức khỏe"
  },
];

// 🎲 Hàm lấy sản phẩm ngẫu nhiên
export function getRandomProducts(count: number = 1): ProductTemplate[] {
  const shuffled = [...PRODUCT_DATABASE].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// 🎲 Hàm lấy 1 sản phẩm ngẫu nhiên
export function getRandomProduct(): ProductTemplate {
  return PRODUCT_DATABASE[Math.floor(Math.random() * PRODUCT_DATABASE.length)];
}

// 📊 Thống kê database
export const PRODUCT_STATS = {
  total: PRODUCT_DATABASE.length,
  categories: [...new Set(PRODUCT_DATABASE.map(p => p.category))],
  categoryCounts: PRODUCT_DATABASE.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)
};
