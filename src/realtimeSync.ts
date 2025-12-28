// ⚡️ REALTIME SYNC SERVICE - Đồng bộ realtime từ Supabase
// Polling mỗi 2-3 giây để cập nhật notifications, transactions, balance

import { supabase } from './supabase';

/**
 * Poll notifications từ Supabase
 * Gọi mỗi 3 giây để lấy notifications mới
 */
export async function pollNotifications(userId: number): Promise<any[]> {
  try {
    // Lấy notifications từ JSONB field trong users table
    const { data, error } = await supabase
      .from('users')
      .select('notifications')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Error polling notifications:', error);
      return [];
    }

    // Notifications được lưu dưới dạng JSONB array
    return data?.notifications || [];
  } catch (error) {
    console.error('❌ Exception polling notifications:', error);
    return [];
  }
}

/**
 * Poll transaction requests status từ Supabase
 * Gọi mỗi 2 giây để kiểm tra trạng thái deposit/withdraw
 */
export async function pollTransactionStatus(userId: number): Promise<{
  deposits: any[];
  withdraws: any[];
}> {
  try {
    // Lấy pending + recent transactions
    const { data, error } = await supabase
      .from('transaction_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('❌ Error polling transactions:', error);
      return { deposits: [], withdraws: [] };
    }

    const deposits = data?.filter(t => t.type === 'deposit') || [];
    const withdraws = data?.filter(t => t.type === 'withdraw') || [];

    return { deposits, withdraws };
  } catch (error) {
    console.error('❌ Exception polling transactions:', error);
    return { deposits: [], withdraws: [] };
  }
}

/**
 * Poll user balance và thông tin tài chính
 * Gọi mỗi 2 giây để sync balance realtime
 */
export async function pollUserBalance(userId: number): Promise<{
  walletBalance: number;
  vipLevel: string;
  creditScore: number;
  totalCommission: number;
  orderQuotaMax: number;
  orderQuotaUsed: number;
  pendingOrders: number;
  vipPoints?: number;
} | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('wallet_balance, vip_level, credit_score, total_commission, order_quota_max, order_quota_used, pending_orders')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Error polling balance:', error);
      return null;
    }

    return {
      walletBalance: Number(data.wallet_balance || 0),
      vipLevel: data.vip_level || 'VIP0',
      creditScore: data.credit_score || 10,
      totalCommission: Number(data.total_commission || 0),
      orderQuotaMax: data.order_quota_max || 0,
      orderQuotaUsed: data.order_quota_used || 0,
      pendingOrders: data.pending_orders || 0
    };
  } catch (error) {
    console.error('❌ Exception polling balance:', error);
    return null;
  }
}

/**
 * Start realtime sync với multiple intervals
 * Returns cleanup function để stop tất cả intervals
 */
export function startRealtimeSync(
  userId: number,
  callbacks: {
    onNotifications?: (notifications: any[]) => void;
    onTransactions?: (data: { deposits: any[]; withdraws: any[] }) => void;
    onBalance?: (balance: any) => void;
  }
): () => void {
  console.log('⚡️ Starting realtime sync for user:', userId);

  const intervals: NodeJS.Timeout[] = [];

  // Poll notifications every 3 seconds
  if (callbacks.onNotifications) {
    const notifInterval = setInterval(async () => {
  const notifications = await pollNotifications(userId);
      callbacks.onNotifications?.(notifications);
    }, 3000);
    intervals.push(notifInterval);
    
    // Initial fetch
  pollNotifications(userId).then(callbacks.onNotifications);
  }

  // Poll transactions every 2 seconds
  if (callbacks.onTransactions) {
    const txInterval = setInterval(async () => {
  const transactions = await pollTransactionStatus(userId);
      callbacks.onTransactions?.(transactions);
    }, 2000);
    intervals.push(txInterval);
    
    // Initial fetch
  pollTransactionStatus(userId).then(callbacks.onTransactions);
  }

  // Poll balance every 2 seconds
  if (callbacks.onBalance) {
    const balanceInterval = setInterval(async () => {
  const balance = await pollUserBalance(userId);
      if (balance) callbacks.onBalance?.(balance);
    }, 2000);
    intervals.push(balanceInterval);
    
    // Initial fetch
  pollUserBalance(userId).then((balance) => {
      if (balance) callbacks.onBalance?.(balance);
    });
  }

  // Return cleanup function
  return () => {
    console.log('🛑 Stopping realtime sync');
    intervals.forEach(interval => clearInterval(interval));
  };
}
