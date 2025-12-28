import { supabase } from '../supabaseClient';

export type DepositStatus = 'pending' | 'approved' | 'rejected';

export interface DepositRequestRow {
  id: number;
  user_id: string;
  account_name: string;
  amount: number;
  status: DepositStatus;
  handled_by?: string;
  reason?: string;
  created_at: string;
  updated_at: string;
}

export async function createDepositRequest({ userId, accountName, amount }: { userId: string; accountName: string; amount: number; }) {
  // Chỉ cho phép nạp tiền cho user đã tồn tại, id là số 5 chữ số
  const uidNum = Number(userId);
  if (!/^[0-9]{5}$/.test(String(uidNum))) {
    return { error: { message: 'ID người dùng phải là số SCLM 5 chữ số!' } };
  }
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, account_name')
    .eq('id', uidNum)
    .maybeSingle();
  if (!user) {
    return { error: { message: 'Không tìm thấy user với ID này! Vui lòng kiểm tra lại.' } };
  }
  // Tạo lệnh nạp tiền trạng thái pending
  return supabase.from('deposit_requests').insert({
    user_id: uidNum,
    account_name: accountName,
    amount,
    status: 'pending',
  });
}

export async function fetchUserDepositRequests(userId: string) {
  return supabase.from('deposit_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}

export async function fetchPendingDeposits() {
  return supabase.from('deposit_requests')
    .select('*')
    .eq('status', 'pending');
}

export async function approveDeposit({ requestId, banker }: { requestId: number; banker: string; }) {
  // Lấy thông tin lệnh nạp để biết user_id và amount
  const { data: requestRows, error: fetchError } = await supabase
    .from('deposit_requests')
    .select('user_id, amount')
    .eq('id', requestId)
    .single();
  if (fetchError || !requestRows) {
    return { error: fetchError || 'Deposit request not found' };
  }
  const { user_id, amount } = requestRows;
  // Cộng số dư cho user
  const { error: balanceError } = await supabase.rpc('increment_user_balance', {
    user_id_param: user_id,
    amount_param: amount
  });
  if (balanceError) {
    return { error: balanceError };
  }
  // Cập nhật trạng thái lệnh
  return supabase.from('deposit_requests')
    .update({ status: 'approved', handled_by: banker, updated_at: new Date().toISOString() })
    .eq('id', requestId);
}

export async function rejectDeposit({ requestId, banker, reason }: { requestId: number; banker: string; reason: string; }) {
  return supabase.from('deposit_requests')
    .update({ status: 'rejected', handled_by: banker, reason, updated_at: new Date().toISOString() })
    .eq('id', requestId);
}
