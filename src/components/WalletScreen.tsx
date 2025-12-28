
import { BankCard, USDTWallet, Transaction, FinancialData, SecuritySettings, LoginLog } from "../types/wallet";
import React, { useState } from "react";
import { formatCurrency } from "../data";
import { Card } from "./Card";
import { ActionButton } from "./ActionButton";
import { EmojiIcon } from "./EmojiIcon";
// ...đã xóa logic Supabase...

// WalletScreen nhận props từ App để đồng bộ số dư và thông tin user



interface WalletScreenProps {
  balance: number;
  frozen: number;
  depositPoints?: number;
  totalCommission?: number;
  vipLevel?: string;
  vipPoints?: number;
  creditScore?: number;
  orderQuotaMax?: number;
  orderQuotaUsed?: number;
  username?: string;
  fullName?: string;
  uid?: number;
  bankCards: BankCard[];
  usdtWallets: USDTWallet[];
  transactions: Transaction[];
  financialData: FinancialData;
  securitySettings: SecuritySettings;
  loginLogs: LoginLog[];
}

// ...existing code...

const WalletScreen: React.FC<WalletScreenProps> = ({
  balance,
  frozen,
  depositPoints,
  totalCommission,
  vipLevel,
  vipPoints,
  creditScore,
  orderQuotaMax,
  orderQuotaUsed,
  username,
  fullName,
  uid,
  bankCards,
  usdtWallets,
  transactions,
  financialData,
  securitySettings,
  loginLogs
}: WalletScreenProps) => {
  // State quản lý danh sách đơn hàng mới được Banker phát xuống cho User
  // State quản lý liên kết
  const [showAddBank, setShowAddBank] = useState(false);
  const [showAddUSDT, setShowAddUSDT] = useState(false);
  const [bankCardsState, setBankCardsState] = useState<BankCard[]>(bankCards);
  const [usdtWalletsState, setUsdtWalletsState] = useState<USDTWallet[]>(usdtWallets);
  // State cho form thêm thẻ mới
  const [newBankName, setNewBankName] = useState("");
  const [newAccountNumber, setNewAccountNumber] = useState("");
  const [newAccountName, setNewAccountName] = useState("");

  // Deposit modal state
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  // ...đã xóa logic Supabase...

  // Handler thêm/xóa liên kết ngân hàng
  const handleAddBank = (card: BankCard) => {
    setBankCardsState([...bankCardsState, card]);
    setShowAddBank(false);
  };
  const handleRemoveBank = (id: string) => {
    setBankCardsState(bankCardsState.filter(card => card.id !== id));
  };
  // Handler thêm/xóa liên kết USDT
  const handleAddUSDT = (wallet: USDTWallet) => {
    setUsdtWalletsState([...usdtWalletsState, wallet]);
    setShowAddUSDT(false);
  };
  const handleRemoveUSDT = (id: string) => {
    setUsdtWalletsState(usdtWalletsState.filter(w => w.id !== id));
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 min-h-screen">
      <div className="p-4 pb-3 max-w-md mx-auto">
        {/* Thông tin ví */}
        <Card className="mb-4 px-4 py-5 relative">
          {/* Chữ VIP 0 ở góc phải trên */}
          <span className="absolute top-3 right-4 flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-xs text-emerald-200 font-semibold">
            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2l2.39 4.84L18 7.27l-4 3.89.94 5.48L10 14.77l-4.94 2.87.94-5.48-4-3.89 5.61-.43z"/></svg>
            {vipLevel} {vipPoints}
          </span>
          {/* Điểm tích lũy ở góc phải dưới */}
          <span className="absolute bottom-3 right-4 px-2 py-0.5 rounded-full bg-white/5 text-xs text-slate-300 border border-white/10">Tích lũy: {formatCurrency(depositPoints ?? 0)}</span>
          <div className="flex items-center mb-2">
            <span className="text-xs text-slate-300 font-medium">Số dư ví</span>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-2xl font-bold text-emerald-300">{formatCurrency(balance)}</span>
            <span className="text-xs text-slate-400">VNĐ</span>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex flex-col items-start">
              <p className="text-[10px] text-slate-400">Đóng băng</p>
              <p className="text-xs font-semibold text-slate-100">{formatCurrency(frozen)}</p>
            </div>
            <div className="h-7 w-px bg-slate-700 mx-2 rounded-full"></div>
            <div className="flex flex-col items-start">
              <p className="text-[10px] text-slate-400">Điểm tín dụng</p>
              <p className="text-xs font-semibold text-slate-100">{creditScore}</p>
            </div>
          </div>
        </Card>

        {/* 3 nút Nạp, Rút, Lịch sử lên trên card liên kết tài khoản */}
        <div className="flex justify-center gap-4 mb-4 w-full">
          {/* Nút Nạp tiền */}
          <button
            className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-400 to-emerald-600 shadow-lg hover:scale-105 transition-transform"
            onClick={() => {
              setShowDepositModal(true);
              setDepositAmount("");
              setDepositStatus(null);
            }}
          >
            <img src="/icon-deposit.svg" alt="Deposit" className="w-7 h-7 mb-1 drop-shadow" />
            <span className="text-xs font-semibold text-white tracking-wide">Nạp tiền</span>
          </button>
          {/* Nút Rút tiền */}
          <button className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 via-blue-400 to-blue-600 shadow-lg hover:scale-105 transition-transform">
            <img src="/icon-withdraw.svg" alt="Withdraw" className="w-7 h-7 mb-1 drop-shadow" />
            <span className="text-xs font-semibold text-white tracking-wide">Rút tiền</span>
          </button>
          {/* Nút Lịch sử giao dịch */}
          <button className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-slate-600 via-slate-500 to-slate-700 shadow-lg hover:scale-105 transition-transform">
            <svg className="w-7 h-7 mb-1 text-white drop-shadow" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-xs font-semibold text-white tracking-wide">Lịch sử giao dịch</span>
          </button>
        </div>
      {/* Modal Nạp tiền */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-xs rounded-2xl bg-slate-950 border border-slate-700 shadow-[0_24px_80px_rgba(0,0,0,0.9)] p-4 text-[11px] text-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-semibold">Tạo lệnh nạp tiền</p>
              </div>
              <button
                onClick={() => setShowDepositModal(false)}
                className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-[11px]"
              >
                ✕
              </button>
            </div>
            {!depositStatus ? (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  const amountNumber = parseFloat(depositAmount || "0");
                  if (!amountNumber || amountNumber <= 0) {
                    window.alert("Vui lòng nhập số tiền hợp lệ.");
                    return;
                  }
                  // ...đã xóa logic Supabase khi nạp tiền...
                }}
                className="space-y-3 mt-2"
              >
                <div>
                  <label className="block text-[10px] mb-1 text-slate-300">Số tiền cần nạp ($)</label>
                  <input
                    type="number"
                    min={1}
                    step="0.01"
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white text-[11px] font-medium placeholder:text-slate-500 outline-none focus:border-sky-400"
                    placeholder="Ví dụ: 100.00"
                    disabled={depositLoading}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-sky-500 text-[12px] font-semibold text-slate-950 shadow-md"
                  disabled={depositLoading}
                >
                  {depositLoading ? "Đang gửi..." : "Tạo lệnh nạp"}
                </button>
              </form>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-[10px] space-y-1.5">
                  <p className="text-slate-300">Lệnh nạp đã tạo</p>
                  <p>
                    Mã lệnh: <span className="font-semibold text-sky-300">{depositStatus.id}</span>
                  </p>
                  <p>
                    Số tiền: <span className="font-semibold text-emerald-300">{formatCurrency(depositStatus.amount)}</span>
                  </p>
                  <p className="text-amber-300">Trạng thái: {depositStatus.status === 'pending' ? '⏳ Đang chờ duyệt' : depositStatus.status === 'approved' ? '✅ Đã duyệt' : '❌ Từ chối'}</p>
                  {depositStatus.status === 'rejected' && (
                    <p className="text-red-400">Lý do: {depositStatus.reason}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDepositModal(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-[11px] font-semibold"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
        {/* Quản lý liên kết tài khoản */}
        <Card className="mb-4 px-4 py-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">Liên kết tài khoản</span>
          </div>
          {/* USDT Wallets */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">Ví USDT</span>
              <ActionButton size="sm" variant="secondary" onClick={() => setShowAddUSDT(true)}>+ Thêm</ActionButton>
            </div>
            {usdtWalletsState.length === 0 ? (
              <div className="text-xs text-slate-500 italic mb-2">Chưa liên kết ví USDT</div>
            ) : (
              <ul className="space-y-2">
                {usdtWalletsState.map(wallet => (
                  <li key={wallet.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                    <div>
                      <span className="text-xs font-semibold text-slate-100">{wallet.network}</span>
                      <span className="ml-2 text-xs text-slate-400">{wallet.address}</span>
                    </div>
                    <button className="text-xs text-red-400 hover:underline" onClick={() => handleRemoveUSDT(wallet.id)}>Xóa</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Bank Cards */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">Quản lý liên kết thẻ ngân hàng</span>
              <ActionButton size="sm" variant="secondary" onClick={() => setShowAddBank(true)}>Quản lý</ActionButton>
            </div>
          </div>
        </Card>

      </div>
      {/* Modal thêm USDT/BankCard (giả lập UI, chưa có form thực tế) */}
      {showAddUSDT && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-slate-800 rounded-xl p-6 w-80">
            <div className="mb-3 text-slate-200 font-semibold">Thêm ví USDT</div>
            <button className="absolute top-2 right-3 text-slate-400" onClick={() => setShowAddUSDT(false)}>✕</button>
            <div className="flex flex-col gap-2">
              <button className="bg-emerald-600 text-white rounded-lg py-2" onClick={() => handleAddUSDT({id: Date.now()+"", network: "TRC20", address: "TXs8fK3Jx...9kL2mP4n", isDefault: false})}>Thêm ví TRC20 demo</button>
            </div>
          </div>
        </div>
      )}
        {showAddBank && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-slate-800 rounded-xl p-6 w-96 relative">
              <div className="mb-3 text-slate-200 font-semibold">Liên kết / quản lý thẻ ngân hàng</div>
              <button className="absolute top-2 right-3 text-slate-400" onClick={() => setShowAddBank(false)}>✕</button>
              {/* Lưu ý chuyên nghiệp cho liên kết tài khoản - chỉ hiển thị trong modal */}
              <div className="mb-4 bg-yellow-900/10 border border-yellow-400/30 rounded-xl px-4 py-3">
                <div className="text-xs text-yellow-300 font-semibold mb-1">Lưu ý khi liên kết tài khoản</div>
                <ul className="list-disc pl-5 text-xs text-yellow-200 space-y-1">
                  <li>Mỗi thẻ ngân hàng chỉ được liên kết một lần cho một tài khoản.</li>
                  <li>Nếu muốn sửa thông tin thẻ đã liên kết, vui lòng liên hệ <span className="underline cursor-pointer text-blue-300" onClick={() => window.open('https://chatlink.ichatlinks.net/widget/standalone.html?eid=f06e847ab6e5b72774424ffe3fea3f46&language=en','_blank','width=400,height=600')}>CSKH</span>.</li>
                  <li>Tất cả các mục nạp tiền và rút tiền đều phải được đồng bộ và kiểm soát bởi Banker. Mọi thay đổi sẽ được áp dụng cho toàn bộ hệ thống và hiển thị nhất quán với từng user.</li>
                </ul>
              </div>
              {/* Thẻ đang liên kết */}
              <div className="mb-4">
                <div className="text-xs text-slate-400 mb-1">Thẻ đang liên kết:</div>
                {bankCardsState.length === 0 ? (
                  <div className="text-xs text-slate-500 italic">Chưa có thẻ nào</div>
                ) : (
                  <ul className="space-y-2">
                    {bankCardsState.map(card => (
                      <li key={card.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                        <div>
                          <span className="text-xs font-semibold text-slate-100">{card.bankName}</span>
                          <span className="ml-2 text-xs text-slate-400">{card.accountNumber} - {card.accountName}</span>
                        </div>
                        <div className="flex gap-2">
                          {!card.isDefault && <button className="text-xs text-slate-300 border border-slate-500 rounded px-2 py-0.5" onClick={() => setBankCardsState(bankCardsState.map(c => ({...c, isDefault: c.id === card.id})))}>Đặt mặc định</button>}
                          <button className="text-xs text-red-400 hover:underline" onClick={() => handleRemoveBank(card.id)}>Xóa</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* Thêm thẻ mới */}
              <form className="flex flex-col gap-3" onSubmit={e => {
                e.preventDefault();
                if (!newBankName || !newAccountNumber || !newAccountName) return;
                handleAddBank({id: Date.now()+"", bankName: newBankName, accountNumber: newAccountNumber, accountName: newAccountName, isDefault: bankCardsState.length === 0});
                setNewBankName(""); setNewAccountNumber(""); setNewAccountName("");
              }}>
                <div className="text-xs text-slate-400">Thêm thẻ mới</div>
                <input className="rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-200" placeholder="VD: Techcombank" value={newBankName} onChange={e => setNewBankName(e.target.value)} />
                <input className="rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-200" placeholder="Nhập số tài khoản" value={newAccountNumber} onChange={e => setNewAccountNumber(e.target.value)} />
                <input className="rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-200" placeholder="VD: NGUYEN VAN A" value={newAccountName} onChange={e => setNewAccountName(e.target.value)} />
                <div className="flex gap-2 justify-end mt-2">
                  <button type="button" className="px-4 py-2 rounded bg-slate-700 text-slate-300" onClick={() => setShowAddBank(false)}>Hủy</button>
                  <button type="submit" className="px-4 py-2 rounded bg-emerald-500 text-white">Lưu thẻ</button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}
export default WalletScreen;







