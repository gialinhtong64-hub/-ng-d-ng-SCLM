// Logic/data cho WalletScreen - tách riêng khỏi UI
import { BankCard, USDTWallet, Transaction, FinancialData, SecuritySettings, LoginLog } from "../types/wallet";

export const mockBankCards: BankCard[] = [
  {
    id: "1",
    bankName: "Vietcombank",
    accountNumber: "1234567890",
    accountName: "NGUYEN VAN A",
    isDefault: true,
  },
  {
    id: "2",
    bankName: "TPBank",
    accountNumber: "9876543210",
    accountName: "TRAN B C",
    isDefault: false,
  },
];

export const mockUSDTWallets: USDTWallet[] = [
  {
    id: "1",
    network: "TRC20",
    address: "TXs8fK3Jx...9kL2mP4n",
    isDefault: true,
  },
];

export const mockTransactions: Transaction[] = [
  { id: "1", type: "deposit", transactionCode: "DEP20241202001", amount: 5000000, time: "2024-12-02 10:30", status: "success", description: "Nạp tiền từ Vietcombank" },
  { id: "2", type: "withdraw", transactionCode: "WD20241201002", amount: -2000000, time: "2024-12-01 15:20", status: "success", description: "Rút tiền về VCB" },
  { id: "3", type: "reward", transactionCode: "REW20241201003", amount: 450000, time: "2024-12-01 09:10", status: "success", description: "Hoa hồng đơn hàng #ORD123" },
  { id: "4", type: "fee", transactionCode: "FEE20241130004", amount: -50000, time: "2024-11-30 18:00", status: "success", description: "Phí xử lý rút tiền" },
  { id: "5", type: "internal", transactionCode: "INT20241130005", amount: 1000000, time: "2024-11-30 14:00", status: "pending", description: "Chuyển nội bộ từ tài khoản phụ" },
  { id: "6", type: "deposit", transactionCode: "DEP20241129006", amount: 3000000, time: "2024-11-29 11:25", status: "success", description: "Nạp USDT qua TRC20" },
];

export const mockFinancialData: FinancialData = {
  totalBalance: 10000000,
  totalDeposit: 20000000,
  totalWithdraw: 10000000,
  profit7Days: 500000,
  profit30Days: 2000000,
  chartData: [
    { date: "2024-12-01", income: 2000000, expense: 1000000 },
    { date: "2024-12-02", income: 3000000, expense: 1500000 },
    { date: "2024-12-03", income: 1000000, expense: 500000 },
  ],
};

export const mockSecuritySettings: SecuritySettings = {
  twoFactorEnabled: true,
  emailVerified: true,
  phoneVerified: false,
  dailyLimit: 50000000,
};

export const mockLoginLogs: LoginLog[] = [
  { id: "1", deviceName: "iPhone 14 Pro", ip: "113.161.xx.xx", location: "Hồ Chí Minh, VN", time: "2024-12-02 08:30", status: "success" },
  { id: "2", deviceName: "Chrome on Windows", ip: "118.70.xx.xx", location: "Hà Nội, VN", time: "2024-12-01 19:45", status: "success" },
  { id: "3", deviceName: "Samsung Galaxy S23", ip: "171.244.xx.xx", location: "Đà Nẵng, VN", time: "2024-11-30 12:15", status: "success" },
  { id: "4", deviceName: "Unknown Device", ip: "103.56.xx.xx", location: "Unknown", time: "2024-11-29 03:22", status: "failed" },
];
