// depositHandler.ts
// Xử lý logic nạp tiền đồng bộ cho toàn app

export type DepositStatus = 'pending' | 'approved' | 'rejected';

export interface DepositRequest {
  id: string;
  username: string;
  amount: number;
  status: DepositStatus;
  createdAt: string;
  updatedAt: string;
  reason?: string; // Lý do từ chối
}

// Lưu vào localStorage (giả lập backend)
const STORAGE_KEY = 'sclm_deposit_requests';

export function getDepositRequests(username: string): DepositRequest[] {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return all.filter((r: DepositRequest) => r.username === username);
  } catch {
    return [];
  }
}

export function createDepositRequest(username: string, amount: number): DepositRequest {
  const req: DepositRequest = {
    id: 'DEP' + Date.now(),
    username,
    amount,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  all.unshift(req);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return req;
}

export function updateDepositRequestStatus(id: string, status: DepositStatus, reason?: string) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const idx = all.findIndex((r: DepositRequest) => r.id === id);
  if (idx >= 0) {
    all[idx].status = status;
    all[idx].updatedAt = new Date().toISOString();
    if (reason) all[idx].reason = reason;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }
}

// Hàm gọi chung cho mọi nơi
export function handleDepositRequest(username: string, amount: number, onResult: (result: DepositRequest) => void) {
  const req = createDepositRequest(username, amount);
  // Giả lập banker duyệt/từ chối sau 3-5s
  setTimeout(() => {
    // Banker random duyệt hoặc từ chối
    const approved = Math.random() > 0.3;
    if (approved) {
      updateDepositRequestStatus(req.id, 'approved');
      onResult({ ...req, status: 'approved', updatedAt: new Date().toISOString() });
    } else {
      updateDepositRequestStatus(req.id, 'rejected', 'Banker từ chối nạp tiền');
      onResult({ ...req, status: 'rejected', updatedAt: new Date().toISOString(), reason: 'Banker từ chối nạp tiền' });
    }
  }, 3000 + Math.random() * 2000);
}
