// 🔥 SUPABASE API SERVICE - ĐỒNG BỘ HOÀN TOÀN VỚI HẬU ĐÀI
// Tất cả tài khoản, đơn hàng, số dư phải được đồng bộ với Supabase

import { supabase, type SupabaseUser, type SupabaseOrder, type SupabaseProduct } from './supabase';
import type { User, Order } from './types';
import { Product } from './data';

// ==================== LOCALSTORAGE FALLBACK ====================
const USERS_KEY = "sclm_users_v1";

/**
 * Fallback: Đăng ký user chỉ với localStorage khi Supabase fail
 */
function registerUserLocalStorage(userData: {
  username: string;
  password: string;
  phone?: string;
  email?: string;
  fullName?: string;
  authCode?: string;
  withdrawalPassword?: string;
}): { success: boolean; user?: User; error?: string } {
  try {
    // Lấy users từ localStorage
    const usersData = localStorage.getItem(USERS_KEY);
    const users: User[] = usersData ? JSON.parse(usersData) : [];
    
    // Kiểm tra username đã tồn tại
    if (users.find(u => u.username === userData.username)) {
      return { success: false, error: 'Tên đăng nhập đã tồn tại' };
    }
    
    // Tạo user mới
    const newUser: any = {
      user_id: Date.now(), // Tạm thời dùng timestamp làm user_id
      username: userData.username,
      password: userData.password,
      fullName: userData.fullName || userData.username,
      phone: userData.phone || '',
      email: userData.email || '',
      walletBalance: 0,
      vipLevel: 'VIP1',
      orderQuotaMax: 50,
      orderQuotaUsed: 0,
      pendingOrders: 0,
      totalCommission: 0,
      creditScore: 100,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    console.log('✅ User registered in localStorage (Supabase fallback)');
    return { success: true, user: newUser };
  } catch (error) {
    console.error('❌ LocalStorage registration failed:', error);
    return { success: false, error: 'Không thể đăng ký tài khoản' };
  }
}

// ==================== USER AUTHENTICATION ====================

/**
 * Đăng ký tài khoản mới - Đồng bộ lên Supabase
 */
export async function registerUser(userData: {
  username: string;
  password: string;
  phone?: string;
  email?: string;
  fullName?: string;
  authCode?: string;
  withdrawalPassword?: string;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    console.log('🔄 Attempting to register user in Supabase...');
    
    // 1. Kiểm tra username đã tồn tại chưa
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('username')
      .eq('username', userData.username)
      .single();

    // Nếu Supabase fail → Fallback về localStorage
    if (checkError && checkError.code !== 'PGRST116') {
      console.warn('⚠️ Supabase connection failed, using localStorage fallback:', checkError);
      return registerUserLocalStorage(userData);
    }

    if (existingUser) {
      return { success: false, error: 'Tên đăng nhập đã tồn tại' };
    }

    // 2. Kiểm tra mã ủy quyền (TẠM THỜI TẮT ĐỂ TEST)
    // TODO: Bật lại khi production
    /*
    if (userData.authCode) {
      const { data: authCodeData } = await supabase
        .from('auth_codes')
        .select('*')
        .eq('code', userData.authCode)
        .single();

      if (!authCodeData) {
        return { success: false, error: 'Mã ủy quyền không hợp lệ' };
      }

      if (authCodeData.is_used) {
        return { success: false, error: 'Mã ủy quyền đã được sử dụng' };
      }
    }
    */
    console.log('⚠️ Auth code check disabled for testing');

    // 3. Tạo user mới trong Supabase
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        username: userData.username,
        password: userData.password, // TODO: Nên hash với bcrypt trước khi lưu
        phone: userData.phone || null,
        email: userData.email || null,
        full_name: userData.fullName || null,
        auth_code: userData.authCode || null,
        withdrawal_password: userData.withdrawalPassword || null,
        wallet_balance: 0,
        vip_level: 'VIP1',
        order_quota_max: 50,
        order_quota_used: 0,
        pending_orders: 0,
        total_commission: 0,
        credit_score: 100,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return { success: false, error: error.message };
    }

    // 4. Đánh dấu auth code đã sử dụng
    if (userData.authCode && newUser) {
      await supabase
        .from('auth_codes')
        .update({
          is_used: true,
          used_by_user_id: newUser.user_id,
          used_at: new Date().toISOString(),
        })
        .eq('code', userData.authCode);
    }

    // 5. Convert sang User type của app
    const user: User = convertSupabaseUserToAppUser(newUser);

    // 6. Lưu vào localStorage để sync (backward compatibility)
    syncUserToLocalStorage(user);

    return { success: true, user };
  } catch (error: any) {
    console.error('Registration error:', error);
    return { success: false, error: error.message || 'Lỗi đăng ký tài khoản' };
  }
}

/**
 * Đăng nhập - Xác thực với Supabase
 */
/**
 * Fallback: Đăng nhập user chỉ với localStorage khi Supabase fail
 */
function loginUserLocalStorage(
  username: string,
  password: string
): { success: boolean; user?: User; error?: string } {
  try {
    const usersData = localStorage.getItem(USERS_KEY);
    if (!usersData) {
      return { success: false, error: 'Tài khoản không tồn tại' };
    }
    
    const users: any[] = JSON.parse(usersData);
    const user = users.find(u => u.username === username);
    
    if (!user) {
      return { success: false, error: 'Tài khoản không tồn tại' };
    }
    
    if (user.password !== password) {
      return { success: false, error: 'Mật khẩu không chính xác' };
    }
    
    // Tạo session token
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    user.sessionToken = sessionToken;
    user.lastLoginTime = new Date().toISOString();
    
    // Cập nhật lại localStorage
    const userIndex = users.findIndex(u => u.username === username);
    users[userIndex] = user;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    console.log('✅ User logged in from localStorage (Supabase fallback)');
    return { success: true, user };
  } catch (error) {
    console.error('❌ LocalStorage login failed:', error);
    return { success: false, error: 'Không thể đăng nhập' };
  }
}

/**
 * Đăng nhập tài khoản
 */
export async function loginUser(
  username: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    console.log('🔄 Attempting to login user from Supabase...');
    
    // 1. Tìm user trong Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    // Nếu Supabase fail → Fallback về localStorage
    if (error && error.code !== 'PGRST116') {
      console.warn('⚠️ Supabase connection failed, using localStorage fallback:', error);
      return loginUserLocalStorage(username, password);
    }

    if (!user) {
      // Thử tìm trong localStorage
      console.warn('⚠️ User not found in Supabase, trying localStorage...');
      return loginUserLocalStorage(username, password);
    }

    // 2. Kiểm tra mật khẩu (TODO: nên dùng bcrypt.compare)
    if (user.password !== password) {
      return { success: false, error: 'Mật khẩu không chính xác' };
    }

    // 3. Kiểm tra trạng thái tài khoản
    if (user.status === 'suspended') {
      return { success: false, error: 'Tài khoản đã bị đình chỉ' };
    }

    if (user.status === 'inactive') {
      return { success: false, error: 'Tài khoản đã bị vô hiệu hóa' };
    }

    // 4. Tạo session token mới
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 5. Cập nhật session token và last login
    await supabase
      .from('users')
      .update({
        session_token: sessionToken,
        last_login_time: new Date().toISOString(),
      })
      .eq('user_id', user.user_id);

    // 6. Convert sang User type
    const appUser: User = {
      ...convertSupabaseUserToAppUser(user),
      sessionToken,
    };

    // 7. Sync to localStorage
    syncUserToLocalStorage(appUser);

    return { success: true, user: appUser };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, error: error.message || 'Lỗi đăng nhập' };
  }
}

/**
 * Lấy TẤT CẢ users từ Supabase (cho Banker Dashboard)
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('register_time', { ascending: false });

    if (error) {
      console.error('Error fetching all users:', error);
      // Fallback to localStorage
      const usersData = localStorage.getItem(USERS_KEY);
      if (usersData) {
        return JSON.parse(usersData);
      }
      return [];
    }

    if (!data || data.length === 0) {
      console.warn('No users found in Supabase, checking localStorage');
      // Fallback to localStorage
      const usersData = localStorage.getItem(USERS_KEY);
      if (usersData) {
        return JSON.parse(usersData);
      }
      return [];
    }

    // Convert all Supabase users to app format
  const users = data.map(convertSupabaseUserToAppUser);
    console.log(`✅ Loaded ${users.length} users from Supabase`);
    return users;
  } catch (error) {
    console.error('Get all users error:', error);
    // Fallback to localStorage
    const usersData = localStorage.getItem(USERS_KEY);
    if (usersData) {
      return JSON.parse(usersData);
    }
    return [];
  }
}

/**
 * Lấy thông tin user từ Supabase theo UID
 */
export async function getUserByUserId(user_id: number): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (error || !data) {
      console.error('Error fetching user:', error);
      return null;
    }

    return convertSupabaseUserToAppUser(data);
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

/**
 * Cập nhật thông tin user - CHỈ CHO PHÉP CẬP NHẬT MỘT SỐ FIELD
 */
/**
 * Update user (cho user tự cập nhật profile - giới hạn một số field)
 */
export async function updateUser(
  user_id: number,
  updates: Partial<{
    phone: string;
    email: string;
    fullName: string;
    withdrawalPassword: string;
  }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: any = {};
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
    if (updates.withdrawalPassword !== undefined) 
      updateData.withdrawal_password = updates.withdrawalPassword;

    const { error } = await supabase
      .from('users')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
  .eq('user_id', user_id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Update user error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update user TOÀN DIỆN - CHỈ CHO BANKER (có thể sửa mọi thứ)
 */
export async function updateUserByBanker(
  user_id: number,
  updates: Partial<{
    username: string;
    password: string;
    phone: string;
    email: string;
    fullName: string;
    walletBalance: number;
    vipLevel: string;
    orderQuotaMax: number;
    orderQuotaUsed: number;
    pendingOrders: number;
    totalCommission: number;
    creditScore: number;
    status: 'active' | 'inactive' | 'suspended';
    authCode: string;
    withdrawalPassword: string;
  }>
): Promise<{ success: boolean; error?: string }> {
  try {
  console.log('🔄 Banker updating user:', user_id, updates);
    
    // Map từ app format sang Supabase format
    const updateData: any = {};
    if (updates.username !== undefined) updateData.username = updates.username;
    if (updates.password !== undefined) updateData.password = updates.password;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
    if (updates.walletBalance !== undefined) updateData.wallet_balance = updates.walletBalance;
    if (updates.vipLevel !== undefined) updateData.vip_level = updates.vipLevel;
    if (updates.orderQuotaMax !== undefined) updateData.order_quota_max = updates.orderQuotaMax;
    if (updates.orderQuotaUsed !== undefined) updateData.order_quota_used = updates.orderQuotaUsed;
    if (updates.pendingOrders !== undefined) updateData.pending_orders = updates.pendingOrders;
    if (updates.totalCommission !== undefined) updateData.total_commission = updates.totalCommission;
    if (updates.creditScore !== undefined) updateData.credit_score = updates.creditScore;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.authCode !== undefined) updateData.auth_code = updates.authCode;
    if (updates.withdrawalPassword !== undefined) updateData.withdrawal_password = updates.withdrawalPassword;

    const { error } = await supabase
      .from('users')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
  .eq('user_id', user_id);

    if (error) {
      console.error('❌ Supabase update failed:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ User updated in Supabase successfully');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Update user by banker error:', error);
    return { success: false, error: error.message || 'Lỗi cập nhật user' };
  }
}

// ==================== ORDERS ====================

/**
 * Tạo đơn hàng mới - CHỈ BANKER CÓ QUYỀN
 * App chỉ nhận đơn được phân phối
 */
export async function createOrder(orderData: {
  user_id: number;
  username: string;
  productName: string;
  productImage?: string;
  orderAmount: number;
  commission: number;
  requiredBalance: number;
  vipLevel: string;
}): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
    // 1. Kiểm tra user có đủ số dư không
  const user = await getUserByUserId(orderData.user_id);
    if (!user) {
      return { success: false, error: 'Người dùng không tồn tại' };
    }

    if (user.walletBalance < orderData.requiredBalance) {
      return { success: false, error: 'Số dư không đủ' };
    }

    // 2. Kiểm tra quota
    if (user.orderQuotaUsed >= user.orderQuotaMax) {
      return { success: false, error: 'Đã đạt giới hạn đơn hàng' };
    }

    // 3. Tạo order ID
    const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // 4. Tạo đơn hàng
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
  user_id: orderData.user_id,
        username: orderData.username,
        product_name: orderData.productName,
        product_image: orderData.productImage || null,
        order_amount: orderData.orderAmount,
        commission: orderData.commission,
        required_balance: orderData.requiredBalance,
        status: 'pending',
        vip_level: orderData.vipLevel,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // 5. Cập nhật user quota và pending orders
    await supabase
      .from('users')
      .update({
        order_quota_used: user.orderQuotaUsed + 1,
        pending_orders: user.pendingOrders + 1,
      })
  .eq('user_id', orderData.user_id);

    return { success: true, order: convertSupabaseOrderToAppOrder(order) };
  } catch (error: any) {
    console.error('Create order error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Lấy danh sách đơn hàng của user
 */
export async function getUserOrders(uid: number): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('uid', uid)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }

    return data.map(convertSupabaseOrderToAppOrder);
  } catch (error) {
    console.error('Get orders error:', error);
    return [];
  }
}

/**
 * Hoàn thành đơn hàng - CHỈ BANKER CÓ QUYỀN
 */
export async function completeOrder(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Lấy thông tin đơn hàng
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (orderError || !order) {
      return { success: false, error: 'Đơn hàng không tồn tại' };
    }

    if (order.status === 'completed') {
      return { success: false, error: 'Đơn hàng đã hoàn thành' };
    }

    // 2. Lấy thông tin user
  const user = await getUserByUserId(order.user_id);
    if (!user) {
      return { success: false, error: 'Người dùng không tồn tại' };
    }

    // 3. Cập nhật trạng thái đơn hàng
    await supabase
      .from('orders')
      .update({
        status: 'completed',
        completion_time: new Date().toISOString(),
      })
      .eq('order_id', orderId);

    // 4. Cập nhật số dư và commission của user
    const newBalance = user.walletBalance + order.commission;
    const newCommission = user.totalCommission + order.commission;

    await supabase
      .from('users')
      .update({
        wallet_balance: newBalance,
        total_commission: newCommission,
        pending_orders: Math.max(0, user.pendingOrders - 1),
      })
      .eq('uid', order.uid);

    // 5. Tạo transaction log
    await supabase
      .from('transactions')
      .insert({
        transaction_id: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
  user_id: order.user_id,
        type: 'commission',
        amount: order.commission,
        balance_before: user.walletBalance,
        balance_after: newBalance,
        status: 'approved',
        processed_at: new Date().toISOString(),
        note: `Hoa hồng từ đơn hàng ${orderId}`,
      });

    return { success: true };
  } catch (error: any) {
    console.error('Complete order error:', error);
    return { success: false, error: error.message };
  }
}

// ==================== PRODUCTS ====================

/**
 * Lấy danh sách sản phẩm từ Supabase
 */
export async function fetchProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return data.map(convertSupabaseProductToAppProduct);
  } catch (error) {
    console.error('Fetch products error:', error);
    return [];
  }
}

/**
 * Lấy sản phẩm nổi bật
 */
export async function fetchFeaturedProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }

    return data.map(convertSupabaseProductToAppProduct);
  } catch (error) {
    console.error('Fetch featured products error:', error);
    return [];
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Convert Supabase User sang App User type
 */
function convertSupabaseUserToAppUser(supabaseUser: SupabaseUser): User {
  return {
    user_id: supabaseUser.user_id,
    username: supabaseUser.username,
    phone: supabaseUser.phone || '',
    email: supabaseUser.email || '',
    fullName: supabaseUser.full_name || undefined,
    walletBalance: Number(supabaseUser.wallet_balance),
    vipLevel: supabaseUser.vip_level,
    orderQuotaMax: supabaseUser.order_quota_max,
    orderQuotaUsed: supabaseUser.order_quota_used,
    pendingOrders: supabaseUser.pending_orders,
    totalCommission: Number(supabaseUser.total_commission),
    creditScore: supabaseUser.credit_score,
    registerTime: supabaseUser.register_time,
    status: supabaseUser.status,
    authCode: supabaseUser.auth_code || undefined,
    withdrawalPassword: supabaseUser.withdrawal_password || undefined,
  };
}

/**
 * Convert Supabase Order sang App Order type
 */
function convertSupabaseOrderToAppOrder(supabaseOrder: SupabaseOrder): Order {
  return {
    orderId: supabaseOrder.order_id,
    user_id: supabaseOrder.user_id,
    username: supabaseOrder.username,
    productName: supabaseOrder.product_name,
    productImage: supabaseOrder.product_image || undefined,
    orderAmount: Number(supabaseOrder.order_amount),
    commission: Number(supabaseOrder.commission),
    requiredBalance: Number(supabaseOrder.required_balance),
    createdAt: supabaseOrder.created_at,
    completionTime: supabaseOrder.completion_time || undefined,
    status: supabaseOrder.status,
    vipLevel: supabaseOrder.vip_level,
  };
}

/**
 * Convert Supabase Product sang App Product type
 */
function convertSupabaseProductToAppProduct(supabaseProduct: SupabaseProduct): Product {
  return {
    id: supabaseProduct.id.toString(),
    name: supabaseProduct.name,
    price: Number(supabaseProduct.price),
    imageUrl: supabaseProduct.image_url || '',
    description: supabaseProduct.description || undefined,
    discountAmount: Number(supabaseProduct.discount_amount),
    discountPercent: Number(supabaseProduct.discount_percent),
    maxOrderQuantity: supabaseProduct.max_order_quantity || undefined,
    createdAt: supabaseProduct.created_at,
    stock: supabaseProduct.stock,
    category: supabaseProduct.category || undefined,
    isFeatured: supabaseProduct.is_featured,
  };
}

/**
 * Sync user data to localStorage (backward compatibility)
 */
function syncUserToLocalStorage(user: User): void {
  try {
    const USERS_KEY = 'sclm_users_v1';
    const usersData = localStorage.getItem(USERS_KEY);
    const users = usersData ? JSON.parse(usersData) : [];
    
    const existingIndex = users.findIndex((u: any) => u.user_id === user.user_id);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem('sclm_current_user_id', user.user_id?.toString() || '');
  } catch (error) {
    console.error('Error syncing to localStorage:', error);
  }
}

// ==================== TRANSACTION REQUESTS ====================

/**
 * Tạo yêu cầu nạp tiền
 */
export async function createDepositRequest(data: {
  user_id: number;
  username: string;
  amount: number;
  method: string;
  bankInfo?: string;
  walletAddress?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('transaction_requests')
      .insert({
  user_id: data.user_id,
        username: data.username,
        type: 'deposit',
        amount: data.amount,
        method: data.method,
        bank_info: data.bankInfo || null,
        wallet_address: data.walletAddress || null,
        status: 'pending',
      });

    if (error) {
      console.error('Error creating deposit request:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Create deposit request error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Tạo yêu cầu rút tiền
 */
export async function createWithdrawRequest(data: {
  user_id: number;
  username: string;
  amount: number;
  method: string;
  bankInfo?: string;
  walletAddress?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('transaction_requests')
      .insert({
  user_id: data.user_id,
        username: data.username,
        type: 'withdraw',
        amount: data.amount,
        method: data.method,
        bank_info: data.bankInfo || null,
        wallet_address: data.walletAddress || null,
        status: 'pending',
      });

    if (error) {
      console.error('Error creating withdraw request:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Create withdraw request error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Lấy danh sách transaction requests (CHỈ BANKER)
 */
export async function getTransactionRequests(type?: 'deposit' | 'withdraw'): Promise<any[]> {
  try {
    let query = supabase
      .from('transaction_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching transaction requests:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Get transaction requests error:', error);
    return [];
  }
}

/**
 * Duyệt yêu cầu nạp tiền (CHỈ BANKER)
 */
export async function approveDepositRequest(requestId: number): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Lấy thông tin request
    const { data: request, error: requestError } = await supabase
      .from('transaction_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      return { success: false, error: 'Không tìm thấy yêu cầu' };
    }

    // 2. Cập nhật số dư user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('uid', request.uid)
      .single();

    if (userError || !user) {
      return { success: false, error: 'Không tìm thấy người dùng' };
    }

    const newBalance = parseFloat(user.wallet_balance) + parseFloat(request.amount);

    const { error: updateError } = await supabase
      .from('users')
      .update({ wallet_balance: newBalance })
      .eq('uid', request.uid);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // 3. Cập nhật trạng thái request
    const { error: statusError } = await supabase
      .from('transaction_requests')
      .update({ 
        status: 'approved',
        processed_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (statusError) {
      return { success: false, error: statusError.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Approve deposit error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Từ chối yêu cầu nạp/rút tiền (CHỈ BANKER)
 */
export async function rejectTransactionRequest(
  requestId: number,
  note: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('transaction_requests')
      .update({ 
        status: 'rejected',
        note: note,
        processed_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Reject transaction error:', error);
    return { success: false, error: error.message };
  }
}
