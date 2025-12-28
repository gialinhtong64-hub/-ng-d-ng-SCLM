// Các type/interface cho Wallet, dùng chung cho UI và logic
export interface BankCard {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
}

export interface USDTWallet {
  id: string;
  network: string;
  address: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  type: "deposit" | "withdraw" | "reward" | "fee" | "internal";
  transactionCode: string;
  amount: number;
  time: string;
  status: "success" | "pending" | "failed";
  description: string;
}

export interface FinancialData {
  totalBalance: number;
  totalDeposit: number;
  totalWithdraw: number;
  profit7Days: number;
  profit30Days: number;
  chartData: { date: string; income: number; expense: number }[];
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  dailyLimit: number;
}

export interface LoginLog {
  id: string;
  deviceName: string;
  ip: string;
  location: string;
  time: string;
  status: "success" | "failed";
}