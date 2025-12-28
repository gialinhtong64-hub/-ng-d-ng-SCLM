# Hướng dẫn tích hợp API Backend

## 📋 Tổng quan

File `src/api.ts` chứa các functions để kết nối với backend API. Hiện tại app đang dùng dữ liệu mock từ `src/data.ts`.

## 🔧 Cấu hình

### 1. Thay đổi URL Backend

Trong file `src/api.ts`, cập nhật `API_BASE_URL`:

```typescript
const API_BASE_URL = 'https://your-backend-api.com/api';
```

Hoặc tạo file `.env` tại thư mục root:

```env
VITE_API_URL=https://your-backend-api.com/api
```

### 2. Authentication (nếu cần)

Nếu backend yêu cầu authentication token, thêm vào headers:

```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}` // Thêm dòng này
}
```

## 📦 Format dữ liệu từ Backend

### Products API Response

Backend cần trả về format sau:

```json
{
  "success": true,
  "data": [
    {
      "id": "123",
      "name": "JmFu/Chang/0.7U1.VL2Lj Manual Hand Operated Meat Grinder",
      "price": 3457.00,
      "imageUrl": "https://cdn.example.com/product-image.jpg",
      "description": "Gourmet Cuisine Hand Pat Chopper Meat Blender Grinder...",
      "discountAmount": 432.13,
      "discountPercent": 12.5,
      "maxOrderQuantity": "X1",
      "createdAt": "2025-11-28 17:22:38",
      "stock": 10,
      "category": "Kitchen Appliances",
      "isFeatured": true
    }
  ]
}
```

### Các trường dữ liệu (Product)

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `id` | string/number | ✅ | ID sản phẩm |
| `name` | string | ✅ | Tên sản phẩm đầy đủ |
| `price` | number | ✅ | Giá trị đơn hàng (USD) |
| `imageUrl` | string | ✅ | URL ảnh sản phẩm |
| `description` | string | ⬜ | Mô tả chi tiết |
| `discountAmount` | number | ⬜ | Tiền chiết khấu thực tế |
| `discountPercent` | number | ⬜ | % chiết khấu |
| `maxOrderQuantity` | string | ⬜ | Lượng đơn tối đa (VD: "X1", "X5") |
| `createdAt` | string | ⬜ | Thời gian tạo (ISO 8601) |
| `stock` | number | ⬜ | Số lượng tồn kho |
| `category` | string | ⬜ | Danh mục sản phẩm |
| `isFeatured` | boolean | ⬜ | Sản phẩm nổi bật |

## 🚀 Cách sử dụng

### Ví dụ 1: Lấy danh sách sản phẩm

**Trong file component (App.tsx, HomeScreen.tsx, v.v.):**

```typescript
import { fetchProducts } from './api';
import { MOCK_PRODUCTS } from './data';

function App() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      if (data.length > 0) {
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      // Vẫn dùng MOCK_PRODUCTS nếu API fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <p>Đang tải sản phẩm...</p>
      ) : (
        products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))
      )}
    </div>
  );
}
```

### Ví dụ 2: Tạo đơn hàng

```typescript
import { createOrder } from './api';

const handleCreateOrder = async () => {
  const result = await createOrder({
    productId: product.id,
    quantity: 1,
    amount: product.price
  });

  if (result.success) {
    alert(`Đơn hàng #${result.orderId} đã được tạo thành công!`);
  } else {
    alert(`Lỗi: ${result.message}`);
  }
};
```

## 🔌 Các API Endpoints

### Products

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/products` | Lấy tất cả sản phẩm |
| GET | `/api/products/:id` | Lấy chi tiết 1 sản phẩm |
| GET | `/api/products/featured` | Lấy sản phẩm nổi bật |

### Orders

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/orders` | Tạo đơn hàng mới |
| GET | `/api/orders` | Lấy lịch sử đơn hàng |
| GET | `/api/orders/:id` | Chi tiết 1 đơn hàng |

### Wallet

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/wallet/balance` | Lấy số dư ví |
| POST | `/api/wallet/deposit` | Nạp tiền |
| POST | `/api/wallet/withdraw` | Rút tiền |

## 🧪 Testing

### Test với Mock API Server (JSON Server)

1. Install JSON Server:
```bash
npm install -g json-server
```

2. Tạo file `db.json`:
```json
{
  "products": [
    {
      "id": "1",
      "name": "Sample Product",
      "price": 3457.00,
      "imageUrl": "https://via.placeholder.com/300",
      "discountAmount": 432.13,
      "maxOrderQuantity": "X1"
    }
  ]
}
```

3. Chạy mock server:
```bash
json-server --watch db.json --port 3001
```

4. Test API:
```bash
curl http://localhost:3001/products
```

## 📝 Notes

- File `src/data.ts` chứa dữ liệu MOCK để test UI
- File `src/api.ts` sẽ thay thế dữ liệu MOCK khi backend sẵn sàng
- Tất cả functions trong `api.ts` đều có error handling và fallback
- Có thể dùng cả MOCK và API cùng lúc trong quá trình phát triển

## 🔗 Liên hệ

Khi backend team sẵn sàng, cung cấp:
1. Base URL của API
2. Authentication method (Bearer token, API key, etc.)
3. API documentation (Swagger/Postman)
4. Sample responses cho từng endpoint
