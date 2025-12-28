// API Service - Tích hợp với backend
// File này chứa các functions để gọi API lấy dữ liệu từ backend

import { Product } from './data';

// Base URL của backend API (sẽ được cấu hình sau)
// Để config: Tạo file .env với VITE_API_URL=https://your-backend-url.com/api
const API_BASE_URL = 'http://localhost:3001/api'; // Thay bằng URL thực tế khi deploy

// ==================== PRODUCTS API ====================

/**
 * Lấy danh sách sản phẩm từ backend
 * @returns Promise<Product[]>
 * 
 * Response format từ backend:
 * {
 *   success: true,
 *   data: [
 *     {
 *       id: "123",
 *       name: "JmFu/Chang/0.7U1.VL2Lj Manual Hand Operated...",
 *       price: 3457.00,
 *       imageUrl: "https://...",
 *       description: "Gourmet Cuisine Hand Pat Chopper Meat...",
 *       discountAmount: 432.13,
 *       discountPercent: 12.5,
 *       maxOrderQuantity: "X1",
 *       createdAt: "2025-11-28 17:22:38",
 *       stock: 10,
 *       category: "Kitchen",
 *       isFeatured: true
 *     }
 *   ]
 * }
 */
export async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Thêm authentication token nếu cần
        // 'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success && Array.isArray(result.data)) {
      return result.data;
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error fetching products:', error);
    // Fallback to mock data nếu API fail
    return [];
  }
}

/**
 * Lấy chi tiết 1 sản phẩm theo ID
 * @param productId - ID của sản phẩm
 * @returns Promise<Product | null>
 */
export async function fetchProductById(productId: string | number): Promise<Product | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

/**
 * Lấy danh sách sản phẩm nổi bật
 * @returns Promise<Product[]>
 */
export async function fetchFeaturedProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/featured`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success && Array.isArray(result.data)) {
      return result.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

// ==================== ORDERS API ====================

/**
 * Tạo đơn hàng mới
 * @param orderData - Dữ liệu đơn hàng
 * @returns Promise<{success: boolean, orderId?: string, message?: string}>
 */
export async function createOrder(orderData: {
  productId: string | number;
  quantity: number;
  amount: number;
}): Promise<{success: boolean, orderId?: string, message?: string}> {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating order:', error);
    return {
      success: false,
      message: 'Không thể tạo đơn hàng. Vui lòng thử lại sau.'
    };
  }
}

// ==================== USER/WALLET API ====================

/**
 * Lấy thông tin số dư ví
 * @returns Promise<{balance: number}>
 */
export async function fetchBalance(): Promise<{balance: number}> {
  try {
    const response = await fetch(`${API_BASE_URL}/wallet/balance`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return { balance: result.data?.balance || 0 };
  } catch (error) {
    console.error('Error fetching balance:', error);
    return { balance: 0 };
  }
}

// ==================== EXPORT ====================

export default {
  fetchProducts,
  fetchProductById,
  fetchFeaturedProducts,
  createOrder,
  fetchBalance,
};
