import React, { useRef, useState, useEffect } from "react";
import { Product, formatCurrency, formatUSDT, formatVND } from "../data";
import FloatingCSKH from "./FloatingCSKH";

const HomeScreen: React.FC<{
  products: Product[];
  balance: number;
  vipLevel?: string;
  accountName?: string;
  avatarUrl?: string;
  onOpenSettings?: () => void;
}> = ({ products, balance, vipLevel = "VIP 1", accountName = "Demo Store", avatarUrl, onOpenSettings }) => {
  // VIP Level info - lấy thông tin theo cấp bậc
  const getVipInfo = (level: string) => {
    const vipData: { [key: string]: { commission: string; maxOrders: number; gradient: string } } = {
      "VIP1": { commission: "1.5%", maxOrders: 5, gradient: "from-rose-500 via-red-600 to-rose-700" },
      "VIP2": { commission: "2.0%", maxOrders: 10, gradient: "from-orange-500 via-orange-600 to-orange-700" },
      "VIP3": { commission: "2.5%", maxOrders: 15, gradient: "from-amber-500 via-amber-600 to-amber-700" },
      "VIP4": { commission: "3.0%", maxOrders: 20, gradient: "from-yellow-500 via-yellow-600 to-yellow-700" },
      "VIP5": { commission: "3.5%", maxOrders: 25, gradient: "from-lime-500 via-lime-600 to-lime-700" },
      "VIP6": { commission: "4.0%", maxOrders: 30, gradient: "from-emerald-500 via-emerald-600 to-emerald-700" },
      "VIP7": { commission: "4.5%", maxOrders: 35, gradient: "from-cyan-500 via-cyan-600 to-cyan-700" },
      "VIP8": { commission: "5.0%", maxOrders: 40, gradient: "from-purple-500 via-purple-600 to-purple-700" }
    };
    const cleanLevel = level.toUpperCase().replace(/\s+/g, '');
    return vipData[cleanLevel] || vipData["VIP1"];
  };

  const vipInfo = getVipInfo(vipLevel);

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositOrderCode, setDepositOrderCode] = useState<string | null>(null);
  
  // Withdraw modal with 3-step flow
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawStep, setWithdrawStep] = useState<1 | 2 | 3>(1);
  const [selectedWithdrawMethod, setSelectedWithdrawMethod] = useState<"bank" | "usdt" | null>(null);
  const [selectedBankCard, setSelectedBankCard] = useState<string | null>(null);
  const [selectedUSDTWallet, setSelectedUSDTWallet] = useState<string | null>(null);
  const [withdrawPasswordInput, setWithdrawPasswordInput] = useState(""); // Mật khẩu rút tiền nhập vào
  
  // Bank & USDT data (demo)
  const [bankCards] = useState([
    { id: "1", bankName: "Vietcombank", accountNumber: "1234567890", accountName: "NGUYEN VAN A" }
  ]);
  const [usdtWallets] = useState([
    { id: "1", network: "TRC20", address: "TXs8fK3Jx...9kL2mP4n" }
  ]);
  
  // Agent registration modal
  const [showAgentModal, setShowAgentModal] = useState(false);

  // Notification (vòng quay may mắn) modal
  const [showNotification, setShowNotification] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [avatar, setAvatar] = useState<string | undefined>(avatarUrl);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleMockClick = (action: string) => {
    window.alert(
      `(DEMO) Chức năng "${action}" hiện đang ở chế độ mô phỏng. Khi triển khai thật sẽ mở màn hình / quy trình tương ứng.`,
    );
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setAvatar(url);
  };

  // Banner carousel (6 sample images). User can add banners via file input.
  // Default to local files placed in `public/banners/` so you can replace them easily.
  // If you placed .jpg files into public/banners/, the carousel will use them.
  const sampleBanners = [
    "/banners/banner1.jpg",
    "/banners/banner2.jpg",
    "/banners/banner3.jpg",
    "/banners/banner4.jpg",
    "/banners/banner5.jpg",
    "/banners/banner6.jpg",
    "/banners/banner7.jpg",
  ];
  const [banners, setBanners] = useState<string[]>(sampleBanners);
  const [currentBanner, setCurrentBanner] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isPaused || banners.length <= 1) return;
    const t = setInterval(() => setCurrentBanner((i) => (i + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, [banners.length, isPaused]);

  const handlePrev = () => setCurrentBanner((i) => (i - 1 + banners.length) % banners.length);
  const handleNext = () => setCurrentBanner((i) => (i + 1) % banners.length);
  const handleAddBannerClick = () => bannerInputRef.current?.click();
  const handleBannerFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setBanners((s) => [url, ...s]);
  };

  const [showLegalModal, setShowLegalModal] = useState(false);

  // CSKH contact - Open chat widget
  const CSKH_LINK = "https://chatlink.ichatlinks.net/widget/standalone.html?eid=f06e847ab6e5b72774424ffe3fea3f46&language=en";
  
  const handleCSKHClick = () => {
    window.open(CSKH_LINK, '_blank', 'width=400,height=600');
  };

  const quickActions = [
    { label: "Nạp tiền", icon: "💰" },
    { label: "Rút Tiền", icon: "💸" },
    { label: "Trở thành đại lý", icon: "🤝" },
    { label: "CSKH", icon: "💬" },
  ];

  const levels = [
    { level: "VIP 1", start: 100, discount: "1.5%", maxOrder: 5, color: "from-slate-200 to-slate-300" },
    { level: "VIP 2", start: 388, discount: "2.5%", maxOrder: 8, color: "from-sky-200 to-sky-400" },
    { level: "VIP 3", start: 1888, discount: "5%", maxOrder: 15, color: "from-blue-300 to-blue-500" },
    { level: "VIP 4", start: 3888, discount: "7.5%", maxOrder: 20, color: "from-indigo-300 to-indigo-500" },
    { level: "VIP 5", start: 8888, discount: "10%", maxOrder: 25, color: "from-purple-300 to-purple-500" },
    { level: "VIP 6", start: 12888, discount: "12.5%", maxOrder: 30, color: "from-orange-300 to-orange-500" },
    { level: "VIP 7", start: 48888, discount: "15%", maxOrder: 35, color: "from-amber-300 to-amber-500" },
    { level: "VIP 8", start: 88888, discount: "20%", maxOrder: 40, color: "from-gray-300 to-gray-500" },
  ];

  const handleCreateDepositOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNumber = parseFloat(depositAmount || "0");
    if (!amountNumber || amountNumber <= 0) {
      window.alert("Vui lòng nhập số tiền hợp lệ.");
      return;
    }
    
    // GỬI YÊU CẦU NẠP TIỀN LÊN HẬU ĐÀI
    const requestId = `DEP${Date.now()}`;
    const depositRequest = {
      id: requestId,
      userId: accountName || "unknown",
      username: accountName || "unknown",
      amount: amountNumber,
      method: "Chuyển khoản ngân hàng",
      bankInfo: "Vui lòng liên hệ CSKH để nhận thông tin chuyển khoản",
      status: "pending",
      requestTime: new Date().toISOString()
    };
    
    // Lưu vào localStorage để banker xem
    const existingRequests = JSON.parse(localStorage.getItem("sclm_deposit_requests") || "[]");
    existingRequests.push(depositRequest);
    localStorage.setItem("sclm_deposit_requests", JSON.stringify(existingRequests));
    
    const code = `NT${Date.now().toString().slice(-6)}`;
    setDepositOrderCode(code);
    
    alert(`✅ Yêu cầu nạp $${amountNumber.toFixed(2)} đã được gửi!\n\n📋 Mã đơn: ${code}\n⏳ Đang chờ hậu đài duyệt...\n\n💡 Vui lòng liên hệ CSKH để được hướng dẫn chuyển khoản.`);
  };

  const handleCloseDepositModal = () => {
    setShowDepositModal(false);
    setDepositAmount("");
    setDepositOrderCode(null);
  };

  // ========== WITHDRAW HANDLERS ==========
  const handleWithdrawClick = () => {
    setShowWithdrawModal(true);
    setWithdrawAmount("");
    setWithdrawStep(1);
    setSelectedWithdrawMethod(null);
    setSelectedBankCard(null);
    setSelectedUSDTWallet(null);
  };

  const handleWithdrawAmountConfirm = () => {
    const amount = Number(withdrawAmount);
    if (!withdrawAmount || amount <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ");
      return;
    }
    if (amount < 50) {
      alert("Số tiền rút tối thiểu là $50 USD");
      return;
    }
    if (amount > 10000) {
      alert("Số tiền rút tối đa là $10,000 USD");
      return;
    }
    if (amount > balance) {
      alert(`❌ Số dư không đủ!\n\n💰 Số dư khả dụng: ${formatCurrency(balance)}\n💸 Số tiền muốn rút: ${formatCurrency(amount)}`);
      return;
    }
    setWithdrawStep(2);
  };

  const handleWithdrawMethodSelect = (method: "bank" | "usdt", itemId: string) => {
    setSelectedWithdrawMethod(method);
    if (method === "bank") {
      setSelectedBankCard(itemId);
      setSelectedUSDTWallet(null);
    } else {
      setSelectedUSDTWallet(itemId);
      setSelectedBankCard(null);
    }
  };

  const handleWithdrawMethodConfirm = () => {
    if (!selectedWithdrawMethod) {
      alert("Vui lòng chọn phương thức nhận tiền");
      return;
    }
    setWithdrawStep(3); // Chuyển sang bước nhập mật khẩu
  };

  const handleWithdrawFinalConfirm = () => {
    // Kiểm tra mật khẩu rút tiền
    const users = JSON.parse(localStorage.getItem("sclm_users_v1") || "[]");
    const currentUser = users.find((u: any) => u.username === accountName);
    
    if (!currentUser || !currentUser.withdrawalPassword) {
      alert("❌ Lỗi hệ thống!\n\nKhông tìm thấy mật khẩu rút tiền. Vui lòng liên hệ CSKH.");
      return;
    }
    
    if (withdrawPasswordInput !== currentUser.withdrawalPassword) {
      alert("❌ Mật khẩu rút tiền không chính xác!\n\nVui lòng nhập lại mật khẩu rút tiền (6 số).");
      return;
    }

    const method = selectedWithdrawMethod === "bank" 
      ? bankCards.find(b => b.id === selectedBankCard)?.bankName 
      : usdtWallets.find(w => w.id === selectedUSDTWallet)?.network;

    const amount = Number(withdrawAmount);

    // GỬI YÊU CẦU RÚT TIỀN LÊN HẬU ĐÀI
    const requestId = `WD${Date.now()}`;
    const withdrawRequest = {
      id: requestId,
      userId: accountName || "unknown",
      username: accountName || "unknown",
      amount: amount,
      method: method || "Unknown",
      bankInfo: selectedWithdrawMethod === "bank" 
        ? bankCards.find(b => b.id === selectedBankCard)?.accountNumber 
        : undefined,
      walletAddress: selectedWithdrawMethod === "usdt" 
        ? usdtWallets.find(w => w.id === selectedUSDTWallet)?.address 
        : undefined,
      status: "pending",
      requestTime: new Date().toISOString()
    };
    
    // Lưu vào localStorage để banker xem
    const existingRequests = JSON.parse(localStorage.getItem("sclm_withdraw_requests") || "[]");
    existingRequests.push(withdrawRequest);
    localStorage.setItem("sclm_withdraw_requests", JSON.stringify(existingRequests));

    // Thêm thông báo rút tiền thành công vào lịch sử
    const activityLog = {
      id: requestId,
      type: "withdraw",
      title: "Rút tiền thành công",
      content: `Yêu cầu rút ${formatCurrency(amount)} qua ${method} đã được gửi. Mã yêu cầu: ${requestId}`,
      time: new Date().toLocaleString("vi-VN"),
      isRead: false
    };
    const existingActivities = JSON.parse(localStorage.getItem("sclm_activities") || "[]");
    existingActivities.unshift(activityLog); // Thêm vào đầu danh sách
    localStorage.setItem("sclm_activities", JSON.stringify(existingActivities));

    alert(`✅ Rút tiền thành công!\n\n📋 Mã yêu cầu: ${requestId}\n💰 Số tiền: ${formatCurrency(amount)}\n💳 Phương thức: ${method}\n⏳ Đang chờ hậu đài duyệt...\n\n📧 Bạn sẽ nhận thông báo khi được duyệt.`);
    
    setShowWithdrawModal(false);
    setWithdrawAmount("");
    setWithdrawStep(1);
    setSelectedWithdrawMethod(null);
    setWithdrawPasswordInput("");
  };

  const handleCopyOrderCode = () => {
    if (!depositOrderCode) return;
    try {
      navigator.clipboard?.writeText(depositOrderCode);
      window.alert("Đã sao chép mã lệnh nạp (demo).");
    } catch {
      window.alert("Không sao chép được, vui lòng copy thủ công.");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      {/* Banner carousel (auto-rotating) - Hiển thị đầu tiên */}
      <section className="px-4 pt-4 mb-4">
        <div className="relative rounded-2xl overflow-hidden bg-slate-900/70 shadow-lg">
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="w-full h-32 sm:h-40 bg-black/10 flex items-center justify-center"
          >
            {banners.map((b, idx) => (
              <div
                key={b + idx}
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${idx === currentBanner ? 'opacity-100' : 'opacity-0'}`}
              >
                <img src={b} alt={`banner-${idx}`} className="max-w-full max-h-full object-contain" />
              </div>
            ))}

            {/* controls */}
            <button onClick={handlePrev} aria-label="Previous banner" className="absolute left-3 p-2 rounded-full bg-black/40 text-white">‹</button>
            <button onClick={handleNext} aria-label="Next banner" className="absolute right-3 p-2 rounded-full bg-black/40 text-white">›</button>
          </div>

          <div className="px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {banners.map((_, i) => (
                <button key={i} onClick={() => setCurrentBanner(i)} className={`w-2 h-2 rounded-full ${i === currentBanner ? 'bg-white' : 'bg-white/30'}`} aria-label={`Go to banner ${i+1}`} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleAddBannerClick} className="text-sm px-3 py-1 rounded-full bg-slate-700/60">Thêm banner</button>
              <input aria-label="Thêm banner" ref={bannerInputRef} onChange={handleBannerFile} type="file" accept="image/*" className="hidden" />
            </div>
          </div>
        </div>
      </section>

      {/* VIP Card Section - Logo VIP từ public/banners */}
      <section className="px-4 mb-4">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
          <img 
            src={`/banners/logo-${vipLevel.toLowerCase().replace(/\s+/g, '')}.jpg.png`}
            alt={`${vipLevel} Card`}
            className="w-full h-auto object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/banners/logo-vip1.jpg.png';
            }}
          />
        </div>
      </section>

      {/* Demo - 4 nút hành động nhanh */}
      <section className="px-4">
                <div className="space-y-1">
                  <p className="text-white font-bold text-base drop-shadow">
                    ${balance.toFixed(2)}
                  </p>
                  <p className="text-white/90 text-xs font-medium">
                    Mỗi lần: {vipInfo.commission}
                  </p>
                  <p className="text-white/90 text-xs font-medium">
                    Lương đơn tối đa {vipInfo.maxOrders}
                  </p>
                </div>
              </div>

              {/* Right side - Logo VIP & Barcode */}
              <div className="flex flex-col items-end gap-2">
                {/* Logo VIP từ public/banners - tự động sync */}
                <div className="h-20 w-20 bg-white/10 backdrop-blur-sm rounded-lg p-2 flex items-center justify-center">
                  <img 
                    src={`/banners/logo-${vipLevel.toLowerCase().replace(/\s+/g, '')}.jpg.png`}
                    alt={`${vipLevel} Logo`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/banners/logo-vip1.jpg.png';
                    }}
                  />
                </div>
                
                {/* Barcode */}
                <div className="bg-white rounded px-2 py-1">
                  <svg width="60" height="24" viewBox="0 0 60 24" className="barcode">
                    <rect x="0" y="0" width="2" height="24" fill="black"/>
                    <rect x="4" y="0" width="1" height="24" fill="black"/>
                    <rect x="7" y="0" width="3" height="24" fill="black"/>
                    <rect x="12" y="0" width="1" height="24" fill="black"/>
                    <rect x="15" y="0" width="2" height="24" fill="black"/>
                    <rect x="19" y="0" width="1" height="24" fill="black"/>
                    <rect x="22" y="0" width="3" height="24" fill="black"/>
                    <rect x="27" y="0" width="2" height="24" fill="black"/>
                    <rect x="31" y="0" width="1" height="24" fill="black"/>
                    <rect x="34" y="0" width="2" height="24" fill="black"/>
                    <rect x="38" y="0" width="3" height="24" fill="black"/>
                    <rect x="43" y="0" width="1" height="24" fill="black"/>
                    <rect x="46" y="0" width="2" height="24" fill="black"/>
                    <rect x="50" y="0" width="1" height="24" fill="black"/>
                    <rect x="53" y="0" width="3" height="24" fill="black"/>
                    <rect x="58" y="0" width="2" height="24" fill="black"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Store name at bottom */}
            <div className="mt-3 pt-2 border-t border-white/20">
              <p className="text-white text-xs font-medium flex items-center gap-1">
                <span>�</span> {accountName}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo - 4 nút hành động nhanh */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-slate-100">Chức năng</h2>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                if (item.label === "Nạp tiền") {
                  setShowDepositModal(true);
                } else if (item.label === "Rút Tiền") {
                  handleWithdrawClick();
                } else if (item.label === "Trở thành đại lý") {
                  setShowAgentModal(true);
                } else if (item.label === "CSKH") {
                  handleCSKHClick();
                } else {
                  handleMockClick(item.label);
                }
              }}
              className="flex flex-col items-center justify-center rounded-2xl bg-slate-900/80 border border-white/5 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.7)]"
            >
              <div className="h-11 w-11 rounded-2xl flex items-center justify-center mb-1.5">
                {item.label === "Nạp tiền" ? (
                  <img src="/icon-deposit.svg" alt="Nạp tiền" className="w-full h-full" />
                ) : item.label === "Rút Tiền" ? (
                  <img src="/icon-withdraw.svg" alt="Rút tiền" className="w-full h-full" />
                ) : item.label === "CSKH" ? (
                  <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-slate-100/90 to-slate-300/90 flex items-center justify-center shadow-md">
                    <img src="/banners/Logo-cskh.jpg" alt="CSKH" className="w-5 h-5 object-contain" />
                  </div>
                ) : (
                  <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-slate-100/90 to-slate-300/90 flex items-center justify-center shadow-md">
                    <span className="text-[16px]">{item.icon}</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-100 font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Cấp */}
      <section className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-slate-100">Cấp</h2>
          <div className="flex items-center gap-2">
            <button
              className="text-[11px] text-indigo-300"
              onClick={() => setShowVipModal(true)}
            >
              Xem thêm
            </button>
          </div>
        </div>
        {/* compact horizontal VIP bar */}
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-3 items-center px-1">
            {levels.map((vip, idx) => (
              <div
                key={vip.level}
                className={`min-w-[92px] shrink-0 rounded-2xl overflow-hidden shadow-md transform transition duration-200 hover:scale-105 relative`}>
                <img src={`/banners/logo-vip${idx + 1}.jpg.png`} alt={`VIP ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                <div className={`relative p-3 text-white`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold">{vip.level}</span>
                    {idx === 0 && <span className="text-[9px] px-2 py-0.5 rounded-full bg-black/30 text-white font-semibold">Hiện tại</span>}
                  </div>
                  <div className="text-[11px]">
                    <div className="truncate">Hoa hồng <span className="font-semibold">{vip.discount}</span></div>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => setShowVipModal(true)} className="min-w-[90px] shrink-0 rounded-2xl bg-slate-700/60 px-3 py-2 text-[12px] font-semibold">Xem thêm</button>
          </div>
        </div>
      </section>

      {/* VIP details modal with cards */}
      {showVipModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 px-4 py-6 overflow-auto">
          <div className="w-full max-w-md rounded-2xl bg-gradient-to-b from-slate-700 to-slate-800 text-white p-4 shadow-2xl my-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Task</h3>
              <button onClick={() => setShowVipModal(false)} className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white">✕</button>
            </div>

            {/* Progress */}
            <div className="bg-white/10 rounded-xl p-3 mb-4">
              <div className="flex items-center justify-between text-xs text-white/80 mb-2">
                <span>Tiến độ thành viên</span>
                <span>Task 1</span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold">5</span>
                <span className="text-sm text-white/70">13%</span>
              </div>
              <button className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-semibold">
                Nâng cấp Task
              </button>
            </div>

            {/* Title */}
            <div className="text-sm font-semibold mb-3">Thẻ kèo thành viên</div>

            {/* VIP Cards */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {levels.map((vip, index) => {
                const colors = [
                  'from-slate-400 to-slate-500',
                  'from-cyan-400 to-cyan-600',
                  'from-blue-500 to-blue-600',
                  'from-purple-500 to-purple-600',
                  'from-violet-500 to-violet-600',
                  'from-orange-400 to-orange-600',
                  'from-orange-500 to-orange-600',
                  'from-slate-700 to-slate-900',
                ];
                const isCurrent = index === 1; // VIP 2 is current
                
                return (
                  <div 
                    key={vip.level} 
                    className={`relative rounded-xl shadow-lg overflow-hidden ${!isCurrent ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''}`}
                    onClick={() => {
                      if (!isCurrent) {
                        handleCSKHClick();
                      }
                    }}
                  >
                    {/* Background logo image */}
                    <img src={`/banners/logo-vip${index + 1}.jpg.png`} alt={`VIP ${index + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                    
                    {/* Content overlay */}
                    <div className="relative p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-bold text-white">{vip.level}</span>
                            {isCurrent && (
                              <span className="w-5 h-5 rounded-full bg-orange-400 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </span>
                            )}
                          </div>
                          <div className="text-xs mb-1 text-white font-semibold">{formatUSDT(vip.start)}</div>
                          <div className="text-xs text-white">Mỗi lần: <span className="font-semibold">{vip.discount}</span></div>
                          <div className="text-xs text-white">Lượng đơn tối đa <span className="font-semibold">{vip.maxOrder}</span></div>
                        </div>
                        
                        {/* Barcode */}
                        <div className="flex flex-col items-end gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded ${isCurrent ? 'bg-orange-400' : 'bg-white/20'}`}>
                            {isCurrent ? 'Đang sử dụng' : 'Nâng cấp'}
                          </span>
                          <div className="w-16 h-12 bg-white/90 rounded flex items-center justify-center">
                            <svg className="w-14 h-10" viewBox="0 0 60 40">
                              {Array(12).fill(0).map((_, i) => (
                                <rect key={i} x={i * 5} y="8" width={i % 3 === 0 ? "3" : "2"} height="24" fill="black" opacity={0.8} />
                              ))}
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Certificate Section */}
            <div className="mt-4 rounded-xl bg-slate-800/50 border border-slate-700 p-4">
              <div className="text-slate-300 text-sm font-semibold mb-1">SCLM GLOBAL</div>
              <div className="text-xs text-slate-400 mb-2">Hệ thống chuỗi cung ứng toàn cầu</div>
              <div className="text-[10px] text-slate-500 leading-relaxed">
                <div>© 2025 SCLM Global. All Rights Reserved.</div>
                <div>Tên quốc tế viết tắt: SCM TM DV CO., LTD</div>
                <div>Số đăng ký : 0110367441</div>
                <div className="mt-1">Hotline: 0582-779-977 | Email: contact@sclm.vn</div>
              </div>
            </div>

            {/* Close button */}
            <div className="mt-4 flex justify-center">
              <button onClick={() => setShowVipModal(false)} className="px-6 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition-colors">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Chi tiết sự kiện */}
      <section className="px-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-slate-100">Chi tiết sự kiện</h2>
          <button
            className="text-[11px] text-indigo-300"
            onClick={() => handleMockClick("Xem tất cả sự kiện")}
          >
            Xem thêm
          </button>
        </div>

        <div className="space-y-3">
          {[
            {
              title: "🎉 Chương trình khuyến mãi đặc biệt",
              description: "Giảm giá 20% cho tất cả sản phẩm trong tháng 12. Áp dụng cho thành viên VIP từ cấp 3 trở lên.",
              date: "01/12/2025 - 31/12/2025",
              badge: "Đang diễn ra",
              badgeColor: "bg-green-500"
            },
            {
              title: "⭐ ĐIỂM NẠP NHÂN ĐÔI · CƠ HỘI THĂNG CẤP",
              description: "Mỗi lần nạp là một bước tiến gần hơn tới những đặc quyền được thiết kế riêng cho bạn. Sự kiện X2 Điểm Nạp được triển khai như lời tri ân dành cho những tài khoản hoạt động tích cực.",
              date: "15/12/2025 - 31/12/2025",
              badge: "Sắp diễn ra",
              badgeColor: "bg-orange-500"
            },
            {
              title: "🎁 Tặng hoa hồng x2",
              description: "Mọi giao dịch trong khung giờ vàng (18:00 - 22:00) sẽ được nhận hoa hồng gấp đôi.",
              date: "Hàng ngày",
              badge: "Hot",
              badgeColor: "bg-red-500"
            }
          ].map((event, index) => (
            <button
              key={index}
              onClick={() => {
                // Sự kiện "Chương trình khuyến mãi đặc biệt" (index 0)
                if (index === 0) {
                  setShowEventModal(true);
                }
                // Sự kiện "ĐIỂM NẠP NHÂN ĐÔI" (index 1) và "Tặng hoa hồng x2" (index 2)
                else if (index === 1 || index === 2) {
                  alert("🎯 SỰ KIỆN SẮP ĐƯỢC RA MẮT\n\n📢 " + event.title + "\n\n💡 Liên hệ hỗ trợ để biết thêm chi tiết về sự kiện này.\n\n📞 Hotline: 0582-779-977\n📧 Email: contact@sclm.vn");
                } else {
                  handleMockClick(`Chi tiết: ${event.title}`);
                }
              }}
              className="w-full text-left rounded-2xl bg-slate-900/80 border border-white/5 shadow-lg p-4 hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-1">
                  {index === 1 && (
                    <img src="/banners/logo-su-kien-x2.jpg" alt="X2" className="w-8 h-8 object-contain" />
                  )}
                  <h3 className="text-sm font-semibold text-slate-100">{event.title.replace('⭐ ', '')}</h3>
                </div>
                <span className={`${event.badgeColor} text-white text-[9px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap`}>
                  {event.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-2">{event.description}</p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span>📅</span>
                <span>{event.date}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Sản phẩm được đề xuất */}
      <section className="px-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-slate-100">Sản phẩm được đề xuất</h2>
          <button
            className="text-[11px] text-indigo-300"
            onClick={() => handleMockClick("Xem thêm sản phẩm")}
          >
            Xem thêm
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1">
          {products.map((p) => (
            <button
              type="button"
              onClick={() => handleMockClick(`Xem chi tiết sản phẩm ${p.name}`)}
              key={p.id}
              className="min-w-[120px] rounded-2xl bg-slate-900/80 border border-white/5 shadow-[0_14px_40px_rgba(15,23,42,0.9)] overflow-hidden text-left"
            >
              <div className="aspect-[3/4] bg-slate-800 overflow-hidden">
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-2.5">
                <p className="text-[11px] text-slate-100 line-clamp-2 mb-1">{p.name}</p>
                <p className="text-[10px] text-emerald-300 font-semibold">{formatVND(p.price)}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Legal / Trust block (compact card + modal) */}
      <section className="px-4 mb-6">
        <div className="rounded-2xl bg-gradient-to-r from-slate-800/60 to-slate-900/60 p-4 text-slate-100 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <a href="https://dichvucong.gov.vn/p/home/theme/img/header/logo.png" target="_blank" rel="noopener noreferrer" className="block rounded-full overflow-hidden">
                <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <img src="https://dichvucong.gov.vn/p/home/theme/img/header/logo.png" alt="Logo Cục Thuế" className="h-full w-full object-contain" />
                </div>
              </a>
            </div>
            <div className="flex-1 text-sm">
              <div className="font-semibold text-[13px]">VN GIẢM THUẾ GIAO THƯƠNG — HỖ TRỢ DOANH NGHIỆP VIỆT NAM</div>
              <p className="mt-1 text-[12px] opacity-80 line-clamp-3">Nền tảng được du nhập từ Pháp và ký kết nhằm hỗ trợ doanh nghiệp Việt Nam tránh được lệnh trừng phạt thuế của Mỹ. Văn kiện do Thủ Tướng Chính Phủ Phạm Minh Chính ký ngày 21/03/2022 tại Hà Nội, chỉ đạo toàn bộ dự án nhằm giảm chi phí doanh nghiệp từ 13% – 18% ...</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-end">
            <button onClick={() => setShowLegalModal(true)} className="px-3 py-1 rounded-full bg-slate-700/60 text-sm">Xem chi tiết</button>
          </div>
        </div>
      </section>

      {/* Modal Nạp tiền: Nhập số tiền -> tạo mã lệnh -> yêu cầu liên hệ CSKH */}
      {showDepositModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-xs rounded-2xl bg-slate-950 border border-slate-700 shadow-[0_24px_80px_rgba(0,0,0,0.9)] p-4 text-[11px] text-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-semibold">Tạo lệnh nạp tiền</p>
              </div>
              <button
                onClick={handleCloseDepositModal}
                className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-[11px]"
              >
                ✕
              </button>
            </div>

            {!depositOrderCode ? (
              <form onSubmit={handleCreateDepositOrder} className="space-y-3 mt-2">
                <div>
                  <label className="block text-[10px] mb-1 text-slate-300">Số tiền cần nạp ($)</label>
                  <input
                    type="number"
                    min={1}
                    step="0.01"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white text-[11px] font-medium placeholder:text-slate-500 outline-none focus:border-sky-400"
                    placeholder="Ví dụ: 100.00"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-sky-500 text-[12px] font-semibold text-slate-950 shadow-md"
                >
                  Tạo lệnh nạp
                </button>
              </form>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-[10px] space-y-1.5">
                  <p className="text-slate-300">Lệnh nạp đã tạo</p>
                  <p>
                    Mã lệnh: <span className="font-semibold text-sky-300">{depositOrderCode}</span>
                  </p>
                  <p>
                    Số tiền: <span className="font-semibold text-emerald-300">{formatCurrency(parseFloat(depositAmount || "0"))}</span>
                  </p>
                  <p className="text-amber-300">Vui lòng liên hệ CSKH để xác nhận lệnh nạp.</p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCopyOrderCode}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-[11px] font-semibold"
                  >
                    Sao chép mã lệnh
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleCSKHClick(); // Mở CSKH
                      handleCloseDepositModal(); // Đóng modal
                    }}
                    className="flex-1 py-2 rounded-xl bg-sky-500 text-[11px] font-semibold text-slate-950"
                  >
                    Liên hệ CSKH
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCloseDepositModal}
                  className="w-full mt-1 py-2 rounded-xl bg-slate-900 border border-slate-700 text-[11px] text-slate-300"
                >
                  Đóng
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Thông báo: Vòng quay may mắn */}
      {showNotification && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-[92vw] sm:max-w-[360px] max-h-[86vh] overflow-y-auto rounded-2xl bg-white text-slate-900 p-5 shadow-2xl">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold">Vòng quay may mắn — Thông báo</h3>
              <button onClick={() => setShowNotification(false)} className="text-slate-500">✕</button>
            </div>

            <div className="flex gap-3 mb-3">
              <div className="w-20 h-20 rounded-md overflow-hidden bg-slate-100 flex-shrink-0">
                <img src="https://images.pexels.com/photos/164716/pexels-photo-164716.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Vòng quay" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 text-sm text-slate-700">
                <p className="font-semibold mb-2">1. Giới thiệu tổng quan</p>
                <p className="mb-2">Hệ thống SCLM có 8 cấp bậc cửa hàng (VIP 1 → VIP 8). Mỗi cấp bậc thể hiện mức đầu tư – thu nhập – quyền lợi khác nhau. Khi cửa hàng nâng cấp lên cấp mới, chủ cửa hàng sẽ nhận thêm vé quay may mắn với cơ hội trúng phần quà giá trị cao (vàng, xe, điện thoại, tiền mặt, v.v.).</p>

                <p className="font-semibold mb-2">2. Quy trình làm việc với chủ cửa hàng</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Xác nhận cấp bậc hiện tại → Truy cập giao diện “Member Updates”.</li>
                  <li>Tư vấn nâng cấp: giải thích mức đầu tư và tỷ lệ hoa hồng, quyền lợi và vé quay.</li>
                  <li>Thông báo: mỗi lần nâng cấp thành công hệ thống tự động tặng vé quay may mắn (một lần/ vé, không quy đổi tiền mặt).</li>
                  <li>Hướng dẫn hoàn tất: vào “Upgrade Task” → chọn “Upgrade” → kiểm tra & xác nhận thanh toán.</li>
                </ol>
              </div>
            </div>

            <div className="text-xs text-slate-500 mb-3">Ghi chú: Vé quay có thể quy đổi thành voucher/mã giảm giá dùng để mua sản phẩm trên sclm.vn.</div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowNotification(false)} className="px-3 py-2 rounded-full bg-slate-100 text-slate-700">Đóng</button>
              <button
                onClick={() => {
                  setShowNotification(false);
                  try {
                    window.open("https://sclm.vn", "_blank");
                  } catch {
                    window.location.href = "https://sclm.vn";
                  }
                }}
                className="px-3 py-2 rounded-full bg-violet-500 text-white"
              >
                Mở Vòng quay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legal modal (full content) */}
      {showLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-[420px] max-h-[80vh] overflow-y-auto rounded-2xl bg-slate-50 text-slate-900 p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold">VN GIẢM THUẾ GIAO THƯƠNG — HỖ TRỢ DOANH NGHIỆP VIỆT NAM</h3>
              <button onClick={() => setShowLegalModal(false)} className="text-slate-600 text-sm px-2 py-1">✕</button>
            </div>

            <div className="prose prose-sm text-slate-700 text-sm">
              <p><strong>Nền tảng được du nhập từ Pháp và ký kết nhằm hỗ trợ doanh nghiệp Việt Nam tránh được lệnh trừng phạt thuế của Mỹ.</strong> Văn kiện do Thủ Tướng Chính Phủ Phạm Minh Chính ký ngày 21/03/2022 tại Hà Nội, chỉ đạo toàn bộ dự án nhằm giảm chi phí doanh nghiệp từ 13% – 18% trong hoạt động sản xuất – hậu cần – xuất nhập khẩu – thương mại điện tử thông qua chuỗi tối ưu hoá và chính sách giao thương, thuế quan nhập khẩu.</p>

              <p>Chi Cục Thuế hỗ trợ đóng thuế tại chỗ lần đầu, cấp chứng nhận và cho phép truy cập vào Trang Thuế Doanh Nghiệp Quốc Gia theo bộ luật hiện hành được sửa đổi, bổ sung dựa trên Hiến pháp nước CHXHCN Việt Nam năm 1992 và Nghị quyết số 51/2001/QH10.</p>

              <p>Kể từ lần sau, doanh nghiệp chỉ cần nhận sao kê ngân hàng và đóng thuế online — không cần đến Kho Bạc Nhà Nước. Chính sách này góp phần hiện đại hoá quy trình quản lý, giảm thủ tục hành chính theo Nghị quyết 136/NQ-CP (27/12/2017) và Nghị quyết 66/NQ-CP (26/3/2025).</p>

              <div className="rounded-md bg-slate-100 p-3">
                <div className="font-semibold">Thuế Việt Nam - Cục Thuế</div>
                <div className="text-sm mt-2">Cơ Quan Chủ Quản: Bộ Tài Chính • Số Giấy Phép: 207/GP-BC</div>

                <div className="mt-3 font-semibold">SCLM GLOBAL</div>
                <div className="text-sm">Hệ thống chuỗi cung ứng toàn cầu</div>
                <div className="text-sm">© 2025 SCLM Global. All Rights Reserved.</div>
                <div className="text-sm">Tên quốc tế viết tắt: SCM TM DV CO., LTD</div>
                <div className="text-sm">Số đăng ký : 0110367441</div>
                <div className="text-sm">Hotline: 0582-779-977 | Email: contact@sclm.vn</div>
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <button onClick={() => setShowLegalModal(false)} className="px-3 py-1.5 rounded-full bg-slate-700 text-white text-sm">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Agent Registration Modal */}
      {showAgentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Đăng ký đại lý</h3>
              <button onClick={() => setShowAgentModal(false)} className="text-slate-400 text-xl" aria-label="Đóng">✕</button>
            </div>

            <div className="mb-4">
              <div className="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white mb-4">
                <p className="text-sm font-semibold mb-2">🤝 Quyền lợi đại lý SCLM</p>
                <ul className="text-xs space-y-1">
                  <li>✅ Hoa hồng hấp dẫn lên đến 20%</li>
                  <li>✅ Hỗ trợ marketing & training</li>
                  <li>✅ Công cụ quản lý chuyên nghiệp</li>
                  <li>✅ Thưởng doanh số hàng tháng</li>
                </ul>
              </div>

              <div className="rounded-lg bg-blue-50 p-3 mb-3">
                <p className="text-xs text-blue-900 font-medium mb-1">📋 Yêu cầu:</p>
                <ul className="text-xs text-blue-800 space-y-0.5">
                  <li>• Đã xác thực KYC</li>
                  <li>• Có kinh nghiệm kinh doanh online</li>
                  <li>• Cam kết doanh số tối thiểu</li>
                </ul>
              </div>

              <form className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Họ và tên</label>
                  <input 
                    type="text" 
                    placeholder="VD: Nguyễn Văn A"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Số điện thoại</label>
                  <input 
                    type="tel" 
                    placeholder="VD: 0901234567"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Kinh nghiệm</label>
                  <textarea 
                    rows={2}
                    placeholder="Mô tả ngắn kinh nghiệm kinh doanh của bạn..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </form>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowAgentModal(false)}
                className="flex-1 py-2.5 rounded-lg bg-slate-200 text-slate-700 text-sm font-medium"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  alert("✅ Đã gửi đăng ký!\n\n📞 CSKH sẽ liên hệ trong 24h để xác nhận.");
                  setShowAgentModal(false);
                }}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold"
              >
                Gửi đăng ký
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal - 2 Steps */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-slate-900">
                {withdrawStep === 1 ? "💸 Rút tiền từ ví" : "Chọn phương thức"}
              </h3>
              <button onClick={() => setShowWithdrawModal(false)} className="text-slate-400 text-lg">✕</button>
            </div>

            {/* Step 1: Enter Amount */}
            {withdrawStep === 1 && (
              <>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Số tiền muốn rút (USD)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="VD: 100"
                    min="50"
                    max="10000"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-[10px] text-slate-500">Tối thiểu: $50 • Tối đa: $10,000</p>
                    <p className="text-[10px] text-green-600 font-medium">Khả dụng: {formatCurrency(balance)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  {[50, 100, 200, 500, 1000, 5000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setWithdrawAmount(amount.toString())}
                      disabled={amount > balance}
                      className={`py-1.5 rounded-lg text-[11px] font-medium ${
                        amount > balance ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-slate-100 text-slate-700 hover:bg-green-100"
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                  <button
                    onClick={() => setWithdrawAmount(Math.min(10000, balance).toString())}
                    className="py-1.5 rounded-lg bg-green-100 text-green-700 text-[11px] font-medium"
                  >
                    Tối đa
                  </button>
                </div>

                <div className="rounded-lg bg-yellow-50 p-2.5 mb-3">
                  <p className="text-[10px] text-yellow-900 font-medium mb-1">⚠️ Lưu ý:</p>
                  <ul className="text-[10px] text-yellow-800 space-y-0.5">
                    <li>• Hạn mức/ngày: $10,000</li>
                    <li>• Thời gian xử lý: 1-24 giờ</li>
                    <li>• Phí rút tiền: 0% (Miễn phí)</li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setShowWithdrawModal(false)} className="flex-1 py-2 rounded-lg bg-slate-200 text-slate-700 text-sm font-medium">Hủy</button>
                  <button onClick={handleWithdrawAmountConfirm} className="flex-1 py-2 rounded-lg bg-green-500 text-white text-sm font-medium">Tiếp tục →</button>
                </div>
              </>
            )}

            {/* Step 2: Select Method */}
            {withdrawStep === 2 && (
              <>
                <div className="rounded-lg bg-green-50 p-2.5 mb-3">
                  <p className="text-xs text-green-900 font-semibold">Số tiền rút: {formatCurrency(Number(withdrawAmount))}</p>
                </div>

                <p className="text-xs font-medium text-slate-700 mb-2">Chọn tài khoản/ví nhận tiền:</p>

                {bankCards.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] text-slate-500 mb-1.5">🏦 Thẻ ngân hàng</p>
                    <div className="space-y-1.5">
                      {bankCards.map(card => (
                        <button
                          key={card.id}
                          onClick={() => handleWithdrawMethodSelect("bank", card.id)}
                          className={`w-full p-2.5 rounded-lg border-2 text-left ${selectedBankCard === card.id ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-300"}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-slate-900">{card.bankName}</p>
                              <p className="text-[10px] text-slate-600 font-mono">{card.accountNumber}</p>
                              <p className="text-[10px] text-slate-500">{card.accountName}</p>
                            </div>
                            {selectedBankCard === card.id && <span className="text-blue-600 text-lg">✓</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {usdtWallets.length > 0 && (
                  <div>
                    <p className="text-[10px] text-slate-500 mb-1.5">💰 Ví USDT</p>
                    <div className="space-y-1.5">
                      {usdtWallets.map(wallet => (
                        <button
                          key={wallet.id}
                          onClick={() => handleWithdrawMethodSelect("usdt", wallet.id)}
                          className={`w-full p-2.5 rounded-lg border-2 text-left ${selectedUSDTWallet === wallet.id ? "border-green-500 bg-green-50" : "border-slate-200 bg-white hover:border-green-300"}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-slate-900">{wallet.network}</p>
                              <p className="text-[10px] text-slate-600 font-mono break-all">{wallet.address}</p>
                            </div>
                            {selectedUSDTWallet === wallet.id && <span className="text-green-600 text-lg">✓</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <button onClick={() => setWithdrawStep(1)} className="flex-1 py-2 rounded-lg bg-slate-200 text-slate-700 text-sm font-medium">← Quay lại</button>
                  <button
                    onClick={handleWithdrawMethodConfirm}
                    disabled={!selectedWithdrawMethod}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${selectedWithdrawMethod ? "bg-blue-500 text-white" : "bg-slate-300 text-slate-500 cursor-not-allowed"}`}
                  >
                    Tiếp tục →
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Enter Withdrawal Password */}
            {withdrawStep === 3 && (
              <>
                <div className="rounded-lg bg-green-50 p-2.5 mb-3">
                  <p className="text-xs text-green-900 font-semibold">Số tiền rút: {formatCurrency(Number(withdrawAmount))}</p>
                  <p className="text-[10px] text-green-700 mt-1">
                    💳 {selectedWithdrawMethod === "bank" ? "Ngân hàng" : "USDT"} - 
                    {selectedWithdrawMethod === "bank" 
                      ? bankCards.find(b => b.id === selectedBankCard)?.bankName 
                      : usdtWallets.find(w => w.id === selectedUSDTWallet)?.network}
                  </p>
                </div>

                <p className="text-xs font-medium text-slate-700 mb-2">🔐 Nhập mật khẩu rút tiền:</p>
                <input
                  type="password"
                  maxLength={6}
                  value={withdrawPasswordInput}
                  onChange={(e) => setWithdrawPasswordInput(e.target.value)}
                  placeholder="Nhập 6 số mật khẩu rút tiền"
                  className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-300 text-sm font-mono text-center tracking-widest focus:outline-none focus:border-green-500"
                />
                <p className="text-[10px] text-slate-500 mt-1.5 text-center">Mật khẩu rút tiền đã được thiết lập khi đăng ký</p>

                <div className="flex gap-2 mt-4">
                  <button onClick={() => { setWithdrawStep(2); setWithdrawPasswordInput(""); }} className="flex-1 py-2 rounded-lg bg-slate-200 text-slate-700 text-sm font-medium">← Quay lại</button>
                  <button
                    onClick={handleWithdrawFinalConfirm}
                    disabled={withdrawPasswordInput.length !== 6}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${withdrawPasswordInput.length === 6 ? "bg-green-500 text-white" : "bg-slate-300 text-slate-500 cursor-not-allowed"}`}
                  >
                    ✅ Xác nhận rút
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer - SCLM Global Branding */}
      <section className="px-4 pb-8 pt-4">
        <div className="text-center">
          <p className="text-[11px] font-semibold text-slate-400 mb-0.5">SCLM GLOBAL</p>
          <p className="text-[9px] text-slate-500 mb-3">Hệ thống chuỗi cung ứng toàn cầu</p>
          <p className="text-[9px] text-slate-500 leading-tight">Tên quốc tế viết tắt: SCM TM DV CO., LTD</p>
          <p className="text-[9px] text-slate-500 leading-tight">Số đăng ký : 0110367441</p>
          <p className="text-[9px] text-slate-500 leading-tight mt-1 mb-3">Hotline: 0582-779-977 | Email: contact@sclm.vn</p>
          
          {/* Social Media */}
          <div className="border-t border-slate-300/40 my-3"></div>
          <p className="text-[10px] font-semibold text-slate-400 mb-2">Theo dõi chúng tôi</p>
          <div className="flex items-center justify-center gap-4 mb-3">
            {/* Facebook */}
            <a 
              href="https://www.facebook.com/sclm.global.vn/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center hover:scale-110 transition-transform shadow-md"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            {/* TikTok */}
            <a 
              href="https://www.facebook.com/sclm.global.vn/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center hover:scale-110 transition-transform shadow-md"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a 
              href="https://www.facebook.com/sclm.global.vn/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center hover:scale-110 transition-transform shadow-md"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
          
          <div className="border-t border-slate-300/40 mb-3"></div>
          <div className="flex items-center justify-between text-[8px] text-slate-400">
            <span>© 2025 SCLM Global.</span>
            <span>All Rights Reserved.</span>
          </div>
        </div>
      </section>

      {/* Floating CSKH Button */}
      <FloatingCSKH onOpen={handleCSKHClick} />

      {/* Event Modal - Chương trình khuyến mãi đặc biệt */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header with Logo */}
            <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-6 rounded-t-3xl">
              <button
                onClick={() => setShowEventModal(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <span className="text-white text-xl font-bold">×</span>
              </button>
              <div className="flex items-center justify-center mb-4">
                <img src="/banners/logo-su-kien-x2.jpg" alt="Logo sự kiện" className="w-24 h-24 object-contain rounded-2xl bg-white/10 p-2" />
              </div>
              <h2 className="text-2xl font-bold text-white text-center mb-2">🎉 Chương trình khuyến mãi đặc biệt</h2>
              <p className="text-blue-100 text-center text-sm">Nâng cấp VIP - Nhận quà khủng từ SCLM Global</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Section 1 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  1. Giới thiệu tổng quan
                </h3>
                <div className="space-y-2 text-slate-700">
                  <p className="leading-relaxed">• Hệ thống SCLM có <span className="font-semibold text-blue-600">8 cấp bậc cửa hàng</span> (VIP 1 → VIP 8).</p>
                  <p className="leading-relaxed">• Mỗi cấp bậc thể hiện mức <span className="font-semibold">đầu tư – thu nhập – quyền lợi</span> khác nhau.</p>
                  <p className="leading-relaxed">• Khi cửa hàng nâng cấp lên cấp mới, chủ cửa hàng sẽ nhận thêm <span className="font-semibold text-green-600">vé quay may mắn</span> với cơ hội trúng phần quà giá trị cao:</p>
                  <div className="ml-6 mt-2 flex flex-wrap gap-2">
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">🏆 Vàng</span>
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">🚗 Xe hơi</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">📱 Điện thoại</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">💵 Tiền mặt</span>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  2. Quy trình làm việc với chủ cửa hàng
                </h3>
                <div className="space-y-4">
                  {/* Step 1 */}
                  <div className="bg-white rounded-xl p-4 border-l-4 border-blue-500">
                    <h4 className="font-semibold text-slate-900 mb-2">✅ Xác nhận cấp bậc hiện tại</h4>
                    <p className="text-sm text-slate-600">→ Truy cập vào giao diện "Member Updates" để xem họ đang ở cấp VIP nào.</p>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-white rounded-xl p-4 border-l-4 border-purple-500">
                    <h4 className="font-semibold text-slate-900 mb-2">💡 Tư vấn nâng cấp phù hợp</h4>
                    <ul className="text-sm text-slate-600 space-y-1 ml-4">
                      <li>• Giải thích mức đầu tư và tỷ lệ hoa hồng tương ứng từng cấp.</li>
                      <li>• Nêu rõ quyền lợi khi nâng cấp (hoa hồng tăng + nhận vé quay thưởng).</li>
                      <li>• Khuyến khích họ chọn cấp phù hợp với khả năng và mục tiêu thu nhập.</li>
                    </ul>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-white rounded-xl p-4 border-l-4 border-green-500">
                    <h4 className="font-semibold text-slate-900 mb-2">🎁 Thông báo phần thưởng nâng cấp</h4>
                    <ul className="text-sm text-slate-600 space-y-1 ml-4">
                      <li>• Mỗi lần nâng cấp thành công → hệ thống tự động tặng <span className="font-semibold text-green-600">vé quay may mắn</span>.</li>
                      <li>• Vé quay được dùng tại <span className="font-semibold">"Sự kiện vòng quay SCLM Global"</span> (giá trị quà thưởng thực).</li>
                      <li>• <span className="text-amber-600 font-medium">Ghi chú:</span> Mỗi vé quay chỉ dùng 1 lần, không quy đổi tiền mặt.</li>
                    </ul>
                  </div>

                  {/* Step 4 */}
                  <div className="bg-white rounded-xl p-4 border-l-4 border-pink-500">
                    <h4 className="font-semibold text-slate-900 mb-2">📝 Hướng dẫn hoàn tất thao tác</h4>
                    <p className="text-sm text-slate-600">Liên hệ bộ phận hỗ trợ để được tư vấn chi tiết về quy trình nâng cấp.</p>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-center text-white">
                <p className="text-xl font-bold mb-2">🎊 Sự kiện áp dụng từ 01/12/2025 - 31/12/2025</p>
                <p className="text-sm opacity-90 mb-4">Dành cho thành viên VIP từ cấp 3 trở lên</p>
                <div className="flex gap-3 justify-center flex-wrap text-sm">
                  <a href="tel:0582779977" className="bg-white text-green-600 px-5 py-2.5 rounded-full font-semibold hover:bg-green-50 transition-colors">
                    📞 0582-779-977
                  </a>
                  <a href="mailto:contact@sclm.vn" className="bg-white/20 backdrop-blur text-white px-5 py-2.5 rounded-full font-semibold hover:bg-white/30 transition-colors">
                    📧 contact@sclm.vn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
