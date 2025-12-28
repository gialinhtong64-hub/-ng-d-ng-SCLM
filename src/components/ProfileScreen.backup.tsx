import React, { useState } from "react";
import { formatCurrency } from "../data";

interface ProfileScreenProps {
  accountName: string;
  avatarUrl?: string;
  balance: number;
  frozen: number;
  userId: string;
  onLogout: () => void;
  autoOpenSettings?: boolean;
  onCloseSettings?: () => void;
}

// ========== NEW INTERFACES ==========
interface UserProfile {
  avatar: string;
  fullName: string;
  email: string;
  phone: string;
  idCard: string;
  kycStatus: "none" | "pending" | "verified";
  kycLevel: number;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  dailyLimit: number;
}

interface LoginDevice {
  id: string;
  deviceName: string;
  ip: string;
  location: string;
  lastAccess: string;
  isCurrent: boolean;
}

interface Notification {
  id: string;
  type: "transaction" | "system" | "support";
  title: string;
  content: string;
  time: string;
  isRead: boolean;
}

interface NotificationSettings {
  transaction: boolean;
  system: boolean;
  support: boolean;
}

interface StoreInfo {
  status: "active" | "inactive" | "suspended";
  level: number;
  creditScore: number;
  bankLinked: boolean;
  referralCode: string;
}

interface RewardPoint {
  id: string;
  type: "earn" | "spend";
  amount: number;
  description: string;
  date: string;
}

type ProfileView = "main" | "profile" | "security" | "notifications" | "store" | "payment" | "support" | "rewards" | "version";

const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
  accountName, 
  avatarUrl, 
  balance, 
  frozen,
  userId,
  onLogout,
  autoOpenSettings = false,
  onCloseSettings
}) => {
  // ========== VIEW STATE ==========
  const [currentView, setCurrentView] = useState<ProfileView>("main");
  const [showSettings, setShowSettings] = useState(autoOpenSettings);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showVipLevels, setShowVipLevels] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // ========== USER PROFILE ==========
  const [userProfile, setUserProfile] = useState<UserProfile>({
    avatar: avatarUrl || "https://ui-avatars.com/api/?name=Demo&background=3b82f6&color=fff",
    fullName: accountName,
    email: "demo@sclm.vn",
    phone: "+84 901 234 567",
    idCard: "001234567890",
    kycStatus: "verified",
    kycLevel: 2
  });
  const [editingProfile, setEditingProfile] = useState(false);

  // ========== SECURITY ==========
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: true,
    emailVerified: true,
    phoneVerified: true,
    dailyLimit: 10000
  });
  const [loginDevices, setLoginDevices] = useState<LoginDevice[]>([
    { id: "1", deviceName: "iPhone 14 Pro", ip: "113.161.xx.xx", location: "H�?Chí Minh, VN", lastAccess: "2024-12-02 14:30", isCurrent: true },
    { id: "2", deviceName: "Chrome on Windows", ip: "118.70.xx.xx", location: "Hà Nội, VN", lastAccess: "2024-12-01 19:45", isCurrent: false },
    { id: "3", deviceName: "Samsung Galaxy S23", ip: "171.244.xx.xx", location: "Đà Nẵng, VN", lastAccess: "2024-11-30 12:15", isCurrent: false },
  ]);

  // ========== NOTIFICATIONS ==========
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: "1", type: "transaction", title: "Giao dịch thành công", content: "Bạn đã nhận $2,656.50 hoa hồng t�?đơn hàng #UB765487089926", time: "2024-12-02 14:30", isRead: false },
    { id: "2", type: "system", title: "Cập nhật h�?thống", content: "H�?thống s�?bảo trì vào 03:00 - 05:00 ngày 03/12/2025", time: "2024-12-02 10:00", isRead: false },
    { id: "3", type: "support", title: "Phản hồi t�?CSKH", content: "Yêu cầu #CS123456 của bạn đã được x�?lý xong", time: "2024-12-01 16:20", isRead: true },
    { id: "4", type: "transaction", title: "Nạp tiền thành công", content: "Bạn đã nạp $5,000 vào tài khoản", time: "2024-12-01 10:00", isRead: true },
  ]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    transaction: true,
    system: true,
    support: true
  });
  const [notificationFilter, setNotificationFilter] = useState<"all" | "transaction" | "system" | "support">("all");

  // ========== STORE INFO ==========
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    status: "active",
    level: 3,
    creditScore: 850,
    bankLinked: true,
    referralCode: "SCLM" + userId
  });

  // ========== REWARDS ==========
  const [rewardPoints, setRewardPoints] = useState<RewardPoint[]>([
    { id: "1", type: "earn", amount: 500, description: "Hoàn thành 10 đơn hàng", date: "2024-12-02" },
    { id: "2", type: "earn", amount: 200, description: "Giới thiệu thành công 1 người", date: "2024-12-01" },
    { id: "3", type: "spend", amount: -300, description: "Đổi voucher giảm giá", date: "2024-11-30" },
    { id: "4", type: "earn", amount: 1000, description: "Đạt cấp VIP 3", date: "2024-11-28" },
  ]);
  const totalPoints = rewardPoints.reduce((sum, p) => sum + p.amount, 0);

  // Handle auto-open settings from external trigger
  React.useEffect(() => {
    if (autoOpenSettings) {
      setShowSettings(true);
    }
  }, [autoOpenSettings]);

  const handleMenuClick = (menu: string) => {
    // New menu items
    if (menu === "profile") {
      setCurrentView("profile");
    } else if (menu === "security") {
      setCurrentView("security");
    } else if (menu === "notifications") {
      setCurrentView("notifications");
    } else if (menu === "store") {
      setCurrentView("store");
    } else if (menu === "payment") {
      setCurrentView("payment");
    } else if (menu === "support") {
      setCurrentView("support");
    } else if (menu === "rewards") {
      setCurrentView("rewards");
    } else if (menu === "version") {
      setCurrentView("version");
    }
    // Old menu items
    else if (menu === "V�?chúng tôi") {
      setShowSettings(true);
    } else if (menu === "Chính sách & bảo mật") {
      setShowSecurity(true);
    } else if (menu === "Website chính thức") {
      window.open("https://sclm.vn", "_blank");
    } else if (menu === "Cấp") {
      setShowVipLevels(true);
    } else if (menu === "Lịch s�?hoạt động") {
      setShowHistory(true);
    } else {
      window.alert(`(DEMO) Chức năng "${menu}" đang được phát triển.`);
    }
  };

  const handleSettingsItemClick = (item: string) => {
    window.alert(`(DEMO) Chức năng "${item}" đang được phát triển.`);
  };

  // ========== NEW HANDLERS ==========
  const handleProfileEdit = () => {
    setEditingProfile(true);
  };

  const handleProfileSave = (updatedProfile: Partial<UserProfile>) => {
    setUserProfile({ ...userProfile, ...updatedProfile });
    setEditingProfile(false);
    alert("�?Cập nhật thông tin thành công!\n\n📋 Thông tin đã được lưu an toàn vào h�?thống.\n\n💡 Lưu ý: Một s�?thay đổi có th�?cần xác minh qua email hoặc SMS.");
  };

  const handleKYCVerify = () => {
    alert("🆔 Xác minh danh tính KYC\n\n📝 Quy trình xác minh:\n1. Chụp ảnh CCCD/CMND (2 mặt)\n2. Chụp ảnh chân dung (selfie)\n3. Nhập thông tin cá nhân\n4. Ch�?xác minh (1-24 gi�?\n\n💡 Lợi ích KYC:\n�?Tăng hạn mức giao dịch lên $50,000/ngày\n�?M�?khóa tính năng rút tiền\n�?Gia tăng đ�?tin cậy\n�?Bảo v�?tài khoản an toàn\n\n👉 Tiếp tục xác minh ngay?");
  };

  const handleRemoveDevice = (deviceId: string) => {
    const device = loginDevices.find(d => d.id === deviceId);
    
    if (!device) {
      alert("�?Không tìm thấy thiết b�?");
      return;
    }
    
    if (device.isCurrent) {
      alert("⚠️ Không th�?xóa thiết b�?hiện tại!\n\n💡 Bạn đang s�?dụng thiết b�?này đ�?truy cập ứng dụng.");
      return;
    }
    
    if (confirm(`🗑�?Xóa thiết b�?"${device.deviceName}"?\n\n📍 IP: ${device.ip}\n🌍 V�?trí: ${device.location}\n�?Truy cập: ${device.lastAccess}\n\nThiết b�?này s�?cần đăng nhập lại đ�?truy cập tài khoản.`)) {
      setLoginDevices(loginDevices.filter(d => d.id !== deviceId));
      alert("�?Đã xóa thiết b�?thành công!\n\n🔒 Thiết b�?đã b�?ngắt kết nối khỏi tài khoản của bạn.");
    }
  };

  const handleMarkAsRead = (notifId: string) => {
    setNotifications(notifications.map(n => 
      n.id === notifId ? { ...n, isRead: true } : n
    ));
    // Không cần alert cho từng thông báo
  };

  const handleMarkAllAsRead = () => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    if (unreadCount === 0) {
      alert("ℹ️ Tất c�?thông báo đã được đọc rồi!");
      return;
    }
    
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    alert(`�?Đã đánh dấu ${unreadCount} thông báo là đã đọc!`);
  };

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(storeInfo.referralCode).then(() => {
      alert(`�?Đã sao chép mã giới thiệu!\n\n📋 ${storeInfo.referralCode}\n\n💰 Hoa hồng giới thiệu:\n�?Cấp 1: 10% doanh thu\n�?Cấp 2: 5% doanh thu\n�?Cấp 3: 2% doanh thu\n\n🎁 Thưởng thêm khi đạt 10+ người!`);
    }).catch(() => {
      alert(`📋 Mã giới thiệu của bạn:\n\n${storeInfo.referralCode}\n\n(Vui lòng sao chép th�?công)`);
    });
  };

  // ========== ADDITIONAL PROFESSIONAL HANDLERS ==========
  
  const handleToggle2FA = () => {
    const newState = !securitySettings.twoFactorEnabled;
    setSecuritySettings({ ...securitySettings, twoFactorEnabled: newState });
    
    if (newState) {
      alert("�?Đã bật xác thực 2 yếu t�?(2FA)!\n\n🔐 Bảo mật nâng cao:\n�?Yêu cầu mã OTP khi đăng nhập\n�?Gửi qua Email hoặc SMS\n�?Bảo v�?khỏi truy cập trái phép\n\n💡 Tài khoản của bạn gi�?an toàn hơn gấp 10 lần!");
    } else {
      if (confirm("⚠️ Tắt xác thực 2 yếu t�?\n\nTài khoản s�?kém an toàn hơn và d�?b�?tấn công.\n\nBạn có chắc muốn tắt?")) {
        alert("�?Đã tắt xác thực 2 yếu t�?\n\n⚠️ Khuyến ngh�? Bật lại đ�?bảo v�?tài khoản tốt nhất.");
      } else {
        // Revert if user cancels
        setSecuritySettings({ ...securitySettings, twoFactorEnabled: true });
      }
    }
  };

  const handleUpdateDailyLimit = () => {
    const currentLimit = formatCurrency(securitySettings.dailyLimit);
    const newLimit = prompt(`💳 Cập nhật hạn mức giao dịch hàng ngày\n\nHạn mức hiện tại: ${currentLimit}\n\nNhập hạn mức mới (USD):`, securitySettings.dailyLimit.toString());
    
    if (!newLimit) return;
    
    const limitNum = parseFloat(newLimit);
    if (isNaN(limitNum) || limitNum < 0) {
      alert("�?S�?tiền không hợp l�?\n\nVui lòng nhập s�?dương.");
      return;
    }
    
    if (limitNum < 50) {
      alert("⚠️ Hạn mức tối thiểu là $50/ngày.");
      return;
    }
    
    if (limitNum > 50000) {
      alert("⚠️ Hạn mức tối đa là $50,000/ngày.\n\n💡 Đ�?tăng hạn mức cao hơn:\n�?Xác minh KYC Level 3\n�?Liên h�?CSKH đ�?được h�?trợ\n�?Cung cấp giấy t�?chứng minh thu nhập");
      return;
    }
    
    setSecuritySettings({ ...securitySettings, dailyLimit: limitNum });
    alert(`�?Cập nhật hạn mức thành công!\n\n💳 Hạn mức mới: ${formatCurrency(limitNum)}/ngày\n\n📊 Thông tin:\n�?Áp dụng ngay lập tức\n�?Reset mỗi 24 giờ\n�?Tính tổng nạp + rút + giao dịch`);
  };

  const handleContactSupport = () => {
    const CSKH_LINK = "https://chatlink.ichatlinks.net/widget/standalone.html?eid=f06e847ab6e5b72774424ffe3fea3f46&language=en";
    window.open(CSKH_LINK, '_blank', 'width=400,height=600');
  };

  const handleCheckForUpdates = () => {
    alert("�?Bạn đang s�?dụng phiên bản mới nhất!\n\n📱 SCLM Global App v1.0.0\n\n🔄 Thông tin cập nhật:\n�?Tối ưu hiệu suất\n�?Thêm tính năng mới\n�?Sửa lỗi và cải thiện UX\n\n💡 H�?thống s�?t�?động thông báo khi có phiên bản mới.");
  };

  const handleChangePassword = () => {
    alert("🔒 Đổi mật khẩu\n\n📝 Quy trình:\n1. Nhập mật khẩu hiện tại\n2. Nhập mật khẩu mới (8+ ký t�?\n3. Xác nhận mật khẩu mới\n4. Nhận mã OTP qua email/SMS\n\n💡 Mật khẩu mạnh nên có:\n�?Ch�?hoa và ch�?thường\n�?S�?và ký t�?đặc biệt\n�?Tối thiểu 8 ký t�?);
  };

  const handleChangePin = () => {
    alert("🔢 Đổi mã PIN giao dịch\n\n📝 Quy trình:\n1. Nhập PIN hiện tại (6 s�?\n2. Nhập PIN mới (6 s�?\n3. Xác nhận PIN mới\n4. Xác thực qua 2FA\n\n⚠️ Lưu ý:\n�?PIN dùng đ�?xác nhận giao dịch\n�?Khác với mật khẩu đăng nhập\n�?Không chia s�?với bất k�?ai");
  };

  const handleToggleNotificationSetting = (type: keyof NotificationSettings) => {
    const newSettings = { ...notificationSettings, [type]: !notificationSettings[type] };
    setNotificationSettings(newSettings);
    
    const labels = { transaction: "Giao dịch", system: "H�?thống", support: "H�?tr�? };
    const status = newSettings[type] ? "BẬT" : "TẮT";
    alert(`${newSettings[type] ? '�? : '�?} Đã ${status} thông báo ${labels[type]}`);
  };

  const filteredNotifications = notificationFilter === "all" 
    ? notifications 
    : notifications.filter(n => n.type === notificationFilter);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getKYCStatusText = (status: UserProfile["kycStatus"]) => {
    switch(status) {
      case "none": return "Chưa xác minh";
      case "pending": return "Đang x�?lý";
      case "verified": return "Đã xác minh";
    }
  };

  const getKYCStatusColor = (status: UserProfile["kycStatus"]) => {
    switch(status) {
      case "none": return "bg-red-100 text-red-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "verified": return "bg-green-100 text-green-700";
    }
  };

  const getStoreStatusText = (status: StoreInfo["status"]) => {
    switch(status) {
      case "active": return "Đang hoạt động";
      case "inactive": return "Tạm ngưng";
      case "suspended": return "B�?khóa";
    }
  };

  const getStoreStatusColor = (status: StoreInfo["status"]) => {
    switch(status) {
      case "active": return "text-green-600";
      case "inactive": return "text-yellow-600";
      case "suspended": return "text-red-600";
    }
  };

  // ========== MENU ITEMS (Expanded) ==========
  const menuItems = [
    { icon: "�?, label: "H�?sơ tài khoản", action: "profile", badge: userProfile.kycStatus === "verified" ? "�? : "" },
    { icon: "🔐", label: "Trung tâm bảo mật", action: "security", badge: "" },
    { icon: "🔔", label: "Trung tâm thông báo", action: "notifications", badge: unreadCount > 0 ? unreadCount.toString() : "" },
    { icon: "�?, label: "Quản lý cửa hàng", action: "store", badge: "" },
    { icon: "💳", label: "Quản lý thanh toán", action: "payment", badge: "" },
    { icon: "💬", label: "H�?tr�?& FAQ", action: "support", badge: "" },
    { icon: "🎁", label: "Điểm thưởng", action: "rewards", badge: totalPoints > 0 ? totalPoints.toString() : "" },
    { icon: "�?, label: "Phiên bản ứng dụng", action: "version", badge: "" },
    { icon: "�?, label: "Chính sách & bảo mật", action: "Chính sách & bảo mật", badge: "" },
    { icon: "🏆", label: "Website chính thức", action: "Website chính thức", badge: "" },
  ];

  const settingsItems = [
    { label: "Sửa đăng nhập Mật khẩu", value: "edit_password" },
    { label: "Sửa mật khẩu thanh toán", value: "edit_payment_password" },
    { label: "Chọn ngôn ng�?, value: "select_language" },
  ];

  // History/Activity screen
  if (showHistory) {
    const historyData = [
      { 
        id: "UB765487089926",
        type: "order",
        status: "completed",
        amount: 26565.00,
        commission: 2656.50,
        date: "02/12/2025 14:30",
        product: "iPhone 15 Pro Max 256GB"
      },
      { 
        id: "UB765487089925",
        type: "order",
        status: "completed",
        amount: 18888.00,
        commission: 1888.80,
        date: "02/12/2025 12:15",
        product: "Samsung Galaxy S24 Ultra"
      },
      { 
        id: "DEP2025120201",
        type: "deposit",
        status: "completed",
        amount: 5000.00,
        date: "02/12/2025 10:00",
        note: "Nạp tiền qua USDT"
      },
      { 
        id: "UB765487089924",
        type: "order",
        status: "completed",
        amount: 12452.38,
        commission: 1245.24,
        date: "01/12/2025 18:45",
        product: "MacBook Pro 14 inch M3"
      },
      { 
        id: "WD2025120101",
        type: "withdraw",
        status: "pending",
        amount: 3000.00,
        date: "01/12/2025 16:20",
        note: "Rút tiền v�?ví USDT"
      },
      { 
        id: "UB765487089923",
        type: "order",
        status: "completed",
        amount: 8999.00,
        commission: 899.90,
        date: "01/12/2025 14:30",
        product: "iPad Pro 12.9 inch"
      },
    ];

    return (
      <div className="flex-1 overflow-y-auto pb-20 bg-slate-100">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
          <div className="flex items-center gap-3 px-4 py-4">
            <button 
              onClick={() => setShowHistory(false)}
              className="w-8 h-8 flex items-center justify-center"
              aria-label="Quay lại"
            >
              <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-slate-900">Lịch s�?hoạt động</h1>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="px-4 pt-4 pb-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-4 text-white shadow-lg">
              <p className="text-xs opacity-90 mb-1">Tổng hoa hồng</p>
              <p className="text-xl font-bold">{formatCurrency(6690.44)}</p>
              <p className="text-[10px] opacity-75 mt-1">�?+12.5% tháng này</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 text-white shadow-lg">
              <p className="text-xs opacity-90 mb-1">Đơn đã x�?lý</p>
              <p className="text-xl font-bold">24</p>
              <p className="text-[10px] opacity-75 mt-1">Tháng 12/2025</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto">
            {["Tất c�?, "Đơn hàng", "Nạp tiền", "Rút tiền"].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap ${
                  tab === "Tất c�? 
                    ? "bg-slate-900 text-white" 
                    : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* History List */}
        <div className="px-4 pb-4 space-y-3">
          {historyData.map((item) => (
            <div key={item.id} className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-900">
                      {item.type === "order" && "🛍�?Đơn hàng"}
                      {item.type === "deposit" && "💰 Nạp tiền"}
                      {item.type === "withdraw" && "💸 Rút tiền"}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      item.status === "completed" 
                        ? "bg-green-100 text-green-700" 
                        : item.status === "pending"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {item.status === "completed" && "Hoàn thành"}
                      {item.status === "pending" && "Đang x�?lý"}
                      {item.status === "failed" && "Thất bại"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">{item.id}</p>
                </div>
              </div>

              {/* Details */}
              {item.type === "order" && (
                <div className="space-y-1 mb-2">
                  <p className="text-xs text-slate-700">{item.product}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Giá tr�?đơn</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Hoa hồng</span>
                    <span className="font-semibold text-green-600">+{formatCurrency(item.commission!)}</span>
                  </div>
                </div>
              )}

              {(item.type === "deposit" || item.type === "withdraw") && (
                <div className="space-y-1 mb-2">
                  <p className="text-xs text-slate-700">{item.note}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">S�?tiền</span>
                    <span className={`font-semibold ${item.type === "deposit" ? "text-green-600" : "text-orange-600"}`}>
                      {item.type === "deposit" ? "+" : "-"}{formatCurrency(item.amount)}
                    </span>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <p className="text-[10px] text-slate-400">📅 {item.date}</p>
                <button className="text-[10px] text-blue-600 font-medium">Chi tiết �?/button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="px-4 pb-6">
          <button className="w-full py-3 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
            Xem thêm
          </button>
        </div>
      </div>
    );
  }

  // VIP Levels screen
  if (showVipLevels) {
    const levels = [
      { level: "VIP 1", start: 100, discount: "1.5%", maxOrder: 5 },
      { level: "VIP 2", start: 388, discount: "2.5%", maxOrder: 8 },
      { level: "VIP 3", start: 1888, discount: "5%", maxOrder: 15 },
      { level: "VIP 4", start: 3888, discount: "7.5%", maxOrder: 20 },
      { level: "VIP 5", start: 8888, discount: "10%", maxOrder: 25 },
      { level: "VIP 6", start: 12888, discount: "12.5%", maxOrder: 30 },
      { level: "VIP 7", start: 48888, discount: "15%", maxOrder: 35 },
      { level: "VIP 8", start: 88888, discount: "20%", maxOrder: 40 },
    ];

    return (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 rounded-2xl text-white shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-4">
            <div className="text-sm font-semibold mb-3">Th�?kèo thành viên</div>

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
                  <div key={vip.level} className={`relative rounded-xl shadow-lg overflow-hidden`}>
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
                          <div className="text-xs mb-1 text-white font-semibold">{formatCurrency(vip.start)}</div>
                          <div className="text-xs text-white">Mỗi lần: <span className="font-semibold">{vip.discount}</span></div>
                          <div className="text-xs text-white">Lượng đơn tối đa <span className="font-semibold">{vip.maxOrder}</span></div>
                        </div>
                        
                        {/* Barcode */}
                        <div className="flex flex-col items-end gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded ${isCurrent ? 'bg-orange-400' : 'bg-white/20'}`}>
                            {isCurrent ? 'Đang s�?dụng' : 'Nâng cấp'}
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

            {/* Close button */}
            <div className="mt-4 flex justify-center">
              <button onClick={() => setShowVipLevels(false)} className="px-6 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition-colors">
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Security policy screen
  if (showSecurity) {
    return (
      <div className="flex-1 overflow-y-auto pb-20 bg-slate-100">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
          <div className="flex items-center gap-3 px-4 py-4">
            <button 
              onClick={() => setShowSecurity(false)}
              className="w-8 h-8 flex items-center justify-center"
              aria-label="Quay lại"
            >
              <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-slate-900">Bảo mật & An toàn h�?thống</h1>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pt-4 pb-6">
          <div className="rounded-xl bg-white shadow-sm p-5 space-y-5 text-slate-800">
            {/* Intro */}
            <p className="text-sm leading-relaxed">
              SCLM cam kết mang đến môi trường làm việc minh bạch, an toàn và bảo mật cho toàn b�?người dùng. 
              Tất c�?d�?liệu và giao dịch đều được x�?lý trên nền tảng bảo mật cao nhằm ngăn chặn rủi ro và đảm bảo tài sản của từng tài khoản.
            </p>

            {/* Section 1 */}
            <div>
              <h2 className="text-base font-semibold mb-2 text-slate-900">1. Bảo mật thông tin cá nhân</h2>
              <ul className="text-sm space-y-2 list-disc list-inside text-slate-700">
                <li>D�?liệu người dùng được mã hoá toàn b�?trong quá trình truyền tải và lưu tr�?</li>
                <li>H�?thống không chia s�?thông tin cho bất k�?bên th�?ba nào nếu không có s�?đồng ý của chính ch�?</li>
                <li>Mỗi tài khoản được áp dụng phân quyền riêng đ�?đảm bảo tính bảo mật và hạn ch�?truy cập trái phép.</li>
              </ul>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="text-base font-semibold mb-2 text-slate-900">2. An toàn giao dịch</h2>
              <ul className="text-sm space-y-2 list-disc list-inside text-slate-700">
                <li>Các giao dịch nạp, rút, x�?lý đơn đều yêu cầu xác thực rõ ràng trước khi thực hiện.</li>
                <li>H�?thống giám sát t�?động 24/7 và tạm khoá những hoạt động bất thường đ�?bảo v�?người dùng.</li>
                <li>Toàn b�?thao tác được ghi log nhằm phục v�?kiểm tra và x�?lý s�?c�?nhanh chóng.</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="text-base font-semibold mb-2 text-slate-900">3. Bảo v�?tài sản người dùng</h2>
              <ul className="text-sm space-y-2 list-disc list-inside text-slate-700">
                <li>S�?dư tài khoản do người dùng kiểm soát, h�?thống không t�?ý can thiệp hoặc tr�?tiền.</li>
                <li>Mọi lệnh giao dịch đều hiển th�?minh bạch và có cảnh báo trước khi thực hiện.</li>
                <li>Lỗi phát sinh trong đơn hàng hoặc giao dịch s�?được h�?thống t�?động tạm dừng đ�?đảm bảo an toàn.</li>
              </ul>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="text-base font-semibold mb-2 text-slate-900">4. Khuyến ngh�?quan trọng</h2>
              <ul className="text-sm space-y-2 list-disc list-inside text-slate-700">
                <li>Không chia s�?mật khẩu hoặc mã đăng nhập cho bất k�?ai.</li>
                <li>Ch�?truy cập ứng dụng qua các kênh chính thức của SCLM.</li>
                <li>Liên h�?ngay CSKH khi phát hiện dấu hiệu bất thường trên tài khoản.</li>
              </ul>
            </div>

            {/* Contact */}
            <div className="pt-3 border-t border-slate-200">
              <div className="text-sm space-y-1 text-slate-700">
                <p>📧 <span className="font-medium">H�?tr�?</span> sclm.customer@gmail.com</p>
                <p>🌐 <span className="font-medium">Website:</span> sclm.vn</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Settings screen
  if (showSettings) {
    return (
      <div className="flex-1 overflow-y-auto pb-20 bg-slate-100">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
          <div className="flex items-center gap-3 px-4 py-4">
            <button 
              onClick={() => {
                setShowSettings(false);
                onCloseSettings?.();
              }}
              className="w-8 h-8 flex items-center justify-center"
              aria-label="Quay lại"
            >
              <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-slate-900">Thiết lập ngay bây gi�?/h1>
          </div>
        </div>

        {/* Settings List */}
        <div className="px-4 pt-4">
          <div className="rounded-xl bg-white shadow-sm overflow-hidden">
            {settingsItems.map((item, index) => (
              <button
                key={item.value}
                onClick={() => handleSettingsItemClick(item.label)}
                className={`w-full flex items-center justify-between px-4 py-4 ${
                  index !== settingsItems.length - 1 ? 'border-b border-slate-200' : ''
                }`}
              >
                <span className="text-sm text-slate-800">{item.label}</span>
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ========== RENDER VIEWS ==========
  // Simple view rendering - each returns early if active
  if (currentView === "profile") {
    return <ProfileView 
      profile={userProfile} 
      onBack={() => setCurrentView("main")}
      onEdit={handleProfileEdit}
      onKYC={handleKYCVerify}
      editing={editingProfile}
      onSave={handleProfileSave}
      onCancelEdit={() => setEditingProfile(false)}
    />;
  }

  if (currentView === "security") {
    return <SecurityView 
      settings={securitySettings}
      devices={loginDevices}
      onBack={() => setCurrentView("main")}
      onUpdateSettings={(newSettings) => {
        // Check if 2FA changed
        if (newSettings.twoFactorEnabled !== securitySettings.twoFactorEnabled) {
          handleToggle2FA();
        } else {
          setSecuritySettings(newSettings);
        }
      }}
      onRemoveDevice={handleRemoveDevice}
      onUpdateDailyLimit={handleUpdateDailyLimit}
      onChangePassword={handleChangePassword}
      onChangePin={handleChangePin}
    />;
  }

  if (currentView === "notifications") {
    return <NotificationsView 
      notifications={filteredNotifications}
      settings={notificationSettings}
      filter={notificationFilter}
      onBack={() => setCurrentView("main")}
      onFilterChange={setNotificationFilter}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
      onUpdateSettings={setNotificationSettings}
    />;
  }

  if (currentView === "store") {
    return <StoreView 
      storeInfo={storeInfo}
      onBack={() => setCurrentView("main")}
      onCopyReferralCode={handleCopyReferralCode}
    />;
  }

  if (currentView === "payment") {
    return <PaymentView 
      onBack={() => setCurrentView("main")}
      balance={balance}
    />;
  }

  if (currentView === "support") {
    return <SupportView 
      onBack={() => setCurrentView("main")}
      onContactSupport={handleContactSupport}
    />;
  }

  if (currentView === "rewards") {
    return <RewardsView 
      points={rewardPoints}
      totalPoints={totalPoints}
      userLevel={storeInfo.level}
      onBack={() => setCurrentView("main")}
    />;
  }

  if (currentView === "version") {
    return <VersionView 
      onBack={() => setCurrentView("main")}
      onCheckUpdate={handleCheckForUpdates}
    />;
  }

  // ========== MAIN VIEW ==========
  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-slate-100">
      {/* Header mới - Style t�?HomeScreen */}
      <div className="px-4 pt-4 pb-3">
        <div className="relative rounded-3xl bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-400 p-3 shadow-xl text-slate-900">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-12 w-12 rounded-full overflow-hidden ring-2 ring-white/60 shadow-md bg-white/20 flex items-center justify-center">
                  {userProfile.avatar ? (
                    <img src={userProfile.avatar} alt={userProfile.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">👤</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">{userProfile.fullName || accountName}</p>
                <p className="text-[11px] opacity-90">VIP {storeInfo.level}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMenuClick("notifications")}
                className="relative h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow-lg"
              >
                <span className="text-base">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-rose-500 text-[9px] text-white flex items-center justify-center font-semibold shadow">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleMenuClick("V�?chúng tôi")}
                className="h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow-lg"
                aria-label="Cài đặt"
              >
                <span className="text-base">⚙️</span>
              </button>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] opacity-80">
            <span>📧 contact@sclm.vn</span>
            <span>🌐 https://sclm.vn</span>
          </div>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="px-4 -mt-3 mb-4">
        <div className="rounded-2xl bg-gradient-to-r from-pink-200 via-purple-200 to-cyan-200 p-4 shadow-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-700 mb-1">S�?dư của tôi</div>
              <div className="text-lg font-bold text-slate-900">{formatCurrency(balance)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-700 mb-1">S�?lượng đóng lạnh</div>
              <div className="text-lg font-bold text-slate-900">{formatCurrency(frozen)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "📋", label: "Lịch s�?hoạt động", logo: null },
            { icon: "�?, label: "Cấp", logo: "/banners/logo-vip.jpg" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => handleMenuClick(item.label)}
              className="flex flex-col items-center justify-center rounded-xl bg-white/80 py-3 shadow-sm"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center mb-1">
                {item.logo ? (
                  <img src={item.logo} alt={item.label} className="w-6 h-6 object-contain" />
                ) : (
                  <span className="text-xl">{item.icon}</span>
                )}
              </div>
              <span className="text-[9px] text-slate-700 font-medium text-center leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Menu List */}
      <div className="px-4 pt-2 pb-4">
        <div className="rounded-3xl bg-white shadow-lg overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={() => handleMenuClick(item.action)}
              className={`w-full flex items-center justify-between px-5 py-4 ${
                index !== menuItems.length - 1 ? 'border-b border-slate-100' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  {item.action === "support" ? (
                    <img src="/banners/Logo-cskh.jpg" alt="CSKH" className="w-6 h-6 object-contain" />
                  ) : (
                    <span className="text-xl">{item.icon}</span>
                  )}
                </div>
                <span className="text-[15px] text-slate-800 font-medium">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500 text-white font-semibold">
                    {item.badge}
                  </span>
                )}
              </div>
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-4 mb-4">
        <button
          onClick={onLogout}
          className="w-full py-4 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold text-[15px] shadow-lg uppercase tracking-wide"
        >
          Đăng xuất
        </button>
      </div>

      {/* Footer Info */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3 bg-white/90 rounded-2xl p-4 shadow-sm mb-4">
          <div className="w-12 h-12 flex-shrink-0 rounded-full bg-red-600 flex items-center justify-center overflow-hidden">
            <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="#dc2626"/>
              <path d="M24 8l4.5 9.1 10 1.5-7.2 7 1.7 9.9-9-4.7-9 4.7 1.7-9.9-7.2-7 10-1.5z" fill="#fbbf24"/>
            </svg>
          </div>
          <div className="flex-1 text-xs text-slate-700 leading-relaxed">
            <div className="font-semibold text-[13px] mb-0.5">Thu�?Việt Nam - Cục Thu�?Cơ quan ch�?quản:</div>
            <div className="text-slate-600">B�?Tài chính</div>
            <div className="text-[11px] text-slate-500 mt-1">S�?giấy phép: 207/GP-BC</div>
          </div>
        </div>

        {/* SCLM Global Footer */}
        <div className="text-center py-4">
          <p className="text-[11px] font-semibold text-slate-500 mb-0.5">SCLM GLOBAL</p>
          <p className="text-[9px] text-slate-400 mb-3">H�?thống chuỗi cung ứng toàn cầu</p>
          <p className="text-[9px] text-slate-400 leading-tight">Tên quốc t�?viết tắt: SCM TM DV CO., LTD</p>
          <p className="text-[9px] text-slate-400 leading-tight">S�?đăng ký : 0110367441</p>
          <p className="text-[9px] text-slate-400 leading-tight mt-1 mb-3">Hotline: 0582-779-977 | Email: contact@sclm.vn</p>
          <div className="border-t border-slate-300/40 mb-3"></div>
          <div className="flex items-center justify-between text-[8px] text-slate-400">
            <span>© 2025 SCLM Global.</span>
            <span>All Rights Reserved.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== SUB-VIEW COMPONENTS ==========

// Profile View - User account details
const ProfileView: React.FC<{
  profile: UserProfile;
  onBack: () => void;
  onEdit: () => void;
  onKYC: () => void;
  editing: boolean;
  onSave: (profile: Partial<UserProfile>) => void;
  onCancelEdit: () => void;
}> = ({ profile, onBack, onEdit, onKYC, editing, onSave, onCancelEdit }) => {
  const [formData, setFormData] = useState(profile);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 bg-slate-100">
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center" aria-label="Quay lại">
            <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-slate-900">H�?sơ tài khoản</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Avatar */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-200">
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            {editing && (
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
                📷
              </button>
            )}
          </div>
        </div>

        {/* KYC Status */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-900">Trạng thái KYC</span>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
              profile.kycStatus === "verified" ? "bg-green-100 text-green-700" :
              profile.kycStatus === "pending" ? "bg-yellow-100 text-yellow-700" :
              "bg-red-100 text-red-700"
            }`}>
              {profile.kycStatus === "verified" ? "�?Đã xác minh" :
               profile.kycStatus === "pending" ? "�?Đang x�?lý" :
               "�?Chưa xác minh"}
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-3">
            Cấp đ�? Level {profile.kycLevel}/3
          </p>
          {profile.kycStatus !== "verified" && (
            <button
              onClick={onKYC}
              className="w-full py-2 rounded-lg bg-blue-500 text-white text-sm font-medium"
            >
              Xác minh ngay
            </button>
          )}
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="rounded-xl bg-white p-4 shadow-sm space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">H�?và tên</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              disabled={!editing}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm font-medium disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!editing}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm font-medium disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">S�?điện thoại</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!editing}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm font-medium disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">CCCD/CMND</label>
            <input
              type="text"
              value={formData.idCard}
              onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
              disabled={!editing}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm font-medium disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {editing ? (
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onCancelEdit}
                className="flex-1 py-2 rounded-lg bg-slate-200 text-slate-700 text-sm font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium"
              >
                Lưu
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onEdit}
              className="w-full py-2 rounded-lg bg-blue-500 text-white text-sm font-medium"
            >
              Chỉnh sửa thông tin
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

// Due to response length limits, I'll create minimal placeholder views for others
// Security View
const SecurityView: React.FC<{
  settings: SecuritySettings;
  devices: LoginDevice[];
  onBack: () => void;
  onUpdateSettings: (settings: SecuritySettings) => void;
  onRemoveDevice: (deviceId: string) => void;
  onUpdateDailyLimit?: () => void;
  onChangePassword?: () => void;
  onChangePin?: () => void;
}> = ({ settings, devices, onBack, onUpdateSettings, onRemoveDevice, onUpdateDailyLimit, onChangePassword, onChangePin }) => {
  return (
    <div className="flex-1 overflow-y-auto pb-24 bg-slate-100">
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={onBack} className="w-8 h-8" aria-label="Quay lại">
            <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-slate-900">Trung tâm bảo mật</h1>
        </div>
      </div>
      <div className="p-4">
        <div className="bg-white rounded-xl p-4 mb-3 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Cài đặt bảo mật</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-900">Xác thực 2FA</span>
              <input 
                type="checkbox" 
                checked={settings.twoFactorEnabled} 
                onChange={(e) => onUpdateSettings({...settings, twoFactorEnabled: e.target.checked})} 
                className="w-4 h-4"
                aria-label="Bật/tắt xác thực 2 yếu t�?
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-900">Email đã xác minh</span>
              <span className={`text-xs px-2 py-1 rounded font-medium ${settings.emailVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {settings.emailVerified ? '�? : '�?}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-900">SĐT đã xác minh</span>
              <span className={`text-xs px-2 py-1 rounded font-medium ${settings.phoneVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {settings.phoneVerified ? '�? : '�?}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 mb-3 shadow-sm space-y-2">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Hạn mức & Mật khẩu</h3>
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm font-medium text-slate-900">Hạn mức giao dịch/ngày</span>
              <p className="text-xs text-slate-600 mt-0.5">{formatCurrency(settings.dailyLimit)}</p>
            </div>
            <button 
              onClick={onUpdateDailyLimit}
              className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded hover:bg-blue-100"
            >
              Thay đổi
            </button>
          </div>
          <button 
            onClick={onChangePassword}
            className="w-full py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800"
          >
            🔒 Đổi mật khẩu
          </button>
          <button 
            onClick={onChangePin}
            className="w-full py-2.5 bg-slate-200 text-slate-900 text-sm font-medium rounded-lg hover:bg-slate-300"
          >
            🔢 Đổi mã PIN giao dịch
          </button>
        </div>
        
        <div className="bg-white rounded-xl p-4 mb-3 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Thiết b�?đăng nhập</h3>
          <div className="space-y-2">
            {devices.map(device => (
              <div key={device.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{device.deviceName}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{device.location} �?{device.lastAccess}</p>
                </div>
                {!device.isCurrent && (
                  <button onClick={() => onRemoveDevice(device.id)} className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100">Xóa</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Create simple placeholders for remaining views
const NotificationsView: React.FC<any> = ({ notifications, onBack, filter, onFilterChange, onMarkAsRead, onMarkAllAsRead }) => (
  <div className="flex-1 overflow-y-auto pb-24 bg-slate-100">
    <div className="sticky top-0 z-10 bg-white border-b">
      <div className="flex items-center gap-3 px-4 py-4">
        <button onClick={onBack} className="w-8 h-8"><svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
        <h1 className="text-lg font-semibold text-slate-900">Thông báo</h1>
      </div>
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
        {["all", "transaction", "system", "support"].map(f => (
          <button key={f} onClick={() => onFilterChange(f)} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${filter === f ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-900'}`}>
            {f === "all" ? "Tất c�? : f === "transaction" ? "Giao dịch" : f === "system" ? "H�?thống" : "H�?tr�?}
          </button>
        ))}
      </div>
    </div>
    <div className="p-4 space-y-2">
      <button onClick={onMarkAllAsRead} className="text-xs font-medium text-blue-600 mb-2">Đánh dấu tất c�?đã đọc</button>
      {notifications.map((n: Notification) => (
        <div key={n.id} onClick={() => onMarkAsRead(n.id)} className={`bg-white rounded-xl p-3 shadow-sm ${!n.isRead ? 'border-l-4 border-blue-500' : ''}`}>
          <p className="text-sm font-semibold text-slate-900">{n.title}</p>
          <p className="text-xs text-slate-700 my-1">{n.content}</p>
          <p className="text-xs text-slate-500">{n.time}</p>
        </div>
      ))}
    </div>
  </div>
);

const StoreView: React.FC<any> = ({ storeInfo, onBack, onCopyReferralCode }) => (
  <div className="flex-1 overflow-y-auto pb-24 bg-slate-100">
    <div className="sticky top-0 z-10 bg-white border-b">
      <div className="flex items-center gap-3 px-4 py-4">
        <button onClick={onBack} className="w-8 h-8"><svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
        <h1 className="text-lg font-semibold text-slate-900">Quản lý cửa hàng</h1>
      </div>
    </div>
    <div className="p-4 space-y-3">
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-3">
          <div><p className="text-xs text-slate-500 mb-1">Trạng thái</p><p className="text-sm font-semibold text-slate-900">{storeInfo.status === "active" ? "Hoạt động" : "Tạm ngưng"}</p></div>
          <div><p className="text-xs text-slate-500 mb-1">Cấp bậc</p><p className="text-sm font-semibold text-slate-900">Level {storeInfo.level}</p></div>
          <div><p className="text-xs text-slate-500 mb-1">Điểm tín dụng</p><p className="text-sm font-semibold text-slate-900">{storeInfo.creditScore}</p></div>
          <div><p className="text-xs text-slate-500 mb-1">Ngân hàng</p><p className="text-sm font-semibold text-slate-900">{storeInfo.bankLinked ? "Đã liên kết" : "Chưa liên kết"}</p></div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-900 mb-2">Mã giới thiệu</p>
        <div className="flex gap-2">
          <input type="text" value={storeInfo.referralCode} readOnly className="flex-1 px-3 py-2 bg-slate-100 text-slate-900 rounded text-sm font-medium" />
          <button onClick={onCopyReferralCode} className="px-4 py-2 bg-blue-500 text-white rounded text-sm font-medium">Copy</button>
        </div>
      </div>
    </div>
  </div>
);

// PaymentView with full deposit/withdraw logic from WalletScreen
interface BankCard {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
}

interface USDTWallet {
  id: string;
  network: string;
  address: string;
  isDefault: boolean;
}

const PaymentView: React.FC<any> = ({ onBack, balance }) => {
  // ========== DEPOSIT & WITHDRAW STATE ==========
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawStep, setWithdrawStep] = useState<1 | 2>(1);
  const [selectedWithdrawMethod, setSelectedWithdrawMethod] = useState<"bank" | "usdt" | null>(null);
  const [selectedBankCard, setSelectedBankCard] = useState<string | null>(null);
  const [selectedUSDTWallet, setSelectedUSDTWallet] = useState<string | null>(null);

  // ========== BANK & USDT STATE ==========
  const [showBankManager, setShowBankManager] = useState(false);
  const [bankCards, setBankCards] = useState<BankCard[]>([
    { id: "1", bankName: "Vietcombank", accountNumber: "1234567890", accountName: "NGUYEN VAN A", isDefault: true }
  ]);
  const [showAddBank, setShowAddBank] = useState(false);
  const [editingBank, setEditingBank] = useState<BankCard | null>(null);
  
  const [showUSDTManager, setShowUSDTManager] = useState(false);
  const [usdtWallets, setUsdtWallets] = useState<USDTWallet[]>([
    { id: "1", network: "TRC20", address: "TXs8fK3Jx...9kL2mP4n", isDefault: true }
  ]);
  const [showAddUSDT, setShowAddUSDT] = useState(false);
  const [editingUSDT, setEditingUSDT] = useState<USDTWallet | null>(null);

  // ========== DEPOSIT LOGIC ==========
  const handleDepositConfirm = () => {
    const amount = Number(depositAmount);
    if (!depositAmount || amount < 50) {
      alert("💰 S�?tiền nạp không hợp l�?\n\n�?Tối thiểu: $50\n�?Tối đa: $10,000");
      return;
    }
    if (amount > 10000) {
      alert("⚠️ S�?tiền nạp tối đa là $10,000\n\nVui lòng nhập s�?tiền nh�?hơn.");
      return;
    }
    
    setShowDeposit(false);
    alert(`�?Yêu cầu nạp ${formatCurrency(amount)} đã được gửi!\n\n🔄 Đang chuyển đến CSKH đ�?hoàn tất...`);
    window.open("https://chatlink.ichatlinks.net/widget/standalone.html?eid=f06e847ab6e5b72774424ffe3fea3f46&language=en", '_blank', 'width=400,height=600');
  };

  // ========== WITHDRAW LOGIC (2-STEP) ==========
  const handleWithdrawClick = () => {
    setShowWithdraw(true);
    setWithdrawAmount("");
    setWithdrawStep(1);
    setSelectedWithdrawMethod(null);
    setSelectedBankCard(null);
    setSelectedUSDTWallet(null);
  };

  const handleWithdrawAmountConfirm = () => {
    const amount = Number(withdrawAmount);
    if (!withdrawAmount || amount <= 0) {
      alert("Vui lòng nhập s�?tiền hợp l�?);
      return;
    }
    if (amount < 50) {
      alert("S�?tiền rút tối thiểu là $50 USD");
      return;
    }
    if (amount > 10000) {
      alert("S�?tiền rút tối đa là $10,000 USD");
      return;
    }
    if (amount > balance) {
      alert(`�?S�?dư không đ�?\n\n💰 S�?dư kh�?dụng: ${formatCurrency(balance)}\n💸 S�?tiền muốn rút: ${formatCurrency(amount)}`);
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

  const handleWithdrawFinalConfirm = () => {
    if (!selectedWithdrawMethod) {
      alert("Vui lòng chọn phương thức nhận tiền");
      return;
    }

    const method = selectedWithdrawMethod === "bank" 
      ? bankCards.find(b => b.id === selectedBankCard)?.bankName 
      : usdtWallets.find(w => w.id === selectedUSDTWallet)?.network;

    alert(`�?Yêu cầu rút ${formatCurrency(Number(withdrawAmount))} đã được gửi!\n\n💳 Phương thức: ${method}\n�?Thời gian x�?lý: 1-24 giờ\n\n📧 Bạn s�?nhận thông báo qua email khi hoàn tất.`);
    
    setShowWithdraw(false);
    setWithdrawAmount("");
    setWithdrawStep(1);
    setSelectedWithdrawMethod(null);
  };

  // ========== BANK CRUD ==========
  const handleAddBankSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newBank: BankCard = {
      id: Date.now().toString(),
      bankName: formData.get("bankName") as string,
      accountNumber: formData.get("accountNumber") as string,
      accountName: formData.get("accountName") as string,
      isDefault: bankCards.length === 0
    };
    setBankCards([...bankCards, newBank]);
    setShowAddBank(false);
    alert("�?Đã thêm th�?ngân hàng thành công!");
  };

  const handleDeleteBank = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa th�?này?")) {
      setBankCards(bankCards.filter(b => b.id !== id));
      alert("�?Đã xóa th�?ngân hàng!");
    }
  };

  // ========== USDT CRUD ==========
  const handleAddUSDTSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newWallet: USDTWallet = {
      id: Date.now().toString(),
      network: formData.get("network") as string,
      address: formData.get("address") as string,
      isDefault: usdtWallets.length === 0
    };
    setUsdtWallets([...usdtWallets, newWallet]);
    setShowAddUSDT(false);
    alert("�?Đã thêm ví USDT thành công!");
  };

  const handleDeleteUSDT = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa ví này?")) {
      setUsdtWallets(usdtWallets.filter(w => w.id !== id));
      alert("�?Đã xóa ví USDT!");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 bg-slate-100">
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={onBack} className="w-8 h-8"><svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
          <h1 className="text-lg font-semibold text-slate-900">Nạp & Rút tiền</h1>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {/* Balance Display */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-4 text-white shadow-md">
          <p className="text-sm opacity-90 mb-1">S�?dư kh�?dụng</p>
          <p className="text-3xl font-bold">{formatCurrency(balance)}</p>
          <p className="text-xs opacity-75 mt-2">💡 Có th�?rút bất k�?lúc nào</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowDeposit(true)}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mb-2 flex justify-center">
              <img src="/banners/logo-nap-tien.jpg" alt="Nạp tiền" className="w-12 h-12 object-contain" />
            </div>
            <div className="text-sm font-semibold text-slate-900">Nạp tiền</div>
            <div className="text-xs text-slate-600 mt-1">Tối thiểu $50</div>
          </button>

          <button
            onClick={handleWithdrawClick}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mb-2 flex justify-center">
              <img src="/banners/logo-rut-tien.jpg" alt="Rút tiền" className="w-12 h-12 object-contain" />
            </div>
            <div className="text-sm font-semibold text-slate-900">Rút tiền</div>
            <div className="text-xs text-slate-600 mt-1">1-24 gi�?x�?lý</div>
          </button>
        </div>

        {/* Bank & USDT Management */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowBankManager(true)}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className="text-2xl mb-2">🏦</div>
            <div className="text-sm font-semibold text-slate-900">Ngân hàng</div>
            <div className="text-xs text-slate-600 mt-1">{bankCards.length} th�?/div>
          </button>

          <button
            onClick={() => setShowUSDTManager(true)}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className="text-2xl mb-2">�?/div>
            <div className="text-sm font-semibold text-slate-900">Ví USDT</div>
            <div className="text-xs text-slate-600 mt-1">{usdtWallets.length} ví</div>
          </button>
        </div>

        {/* Info Cards */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">📋 Hướng dẫn giao dịch</h3>
          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <span className="text-green-600">�?/span>
              <span>Nạp tiền: Chuyển khoản qua CSKH, h�?tr�?Bank & USDT</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">�?/span>
              <span>Rút tiền: T�?động v�?tài khoản đã liên kết, phí 0%</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">�?/span>
              <span>Hạn mức: $50 - $10,000 mỗi giao dịch</span>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-start gap-2">
            <span className="text-amber-600 text-lg">⚠️</span>
            <div className="flex-1">
              <p className="text-xs font-medium text-amber-900 mb-1">Lưu ý quan trọng</p>
              <p className="text-xs text-amber-800">�?Kiểm tra k�?thông tin trước khi xác nhận<br/>�?Không chia s�?mã OTP với bất k�?ai<br/>�?Liên h�?CSKH nếu có vấn đ�?/p>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <img src="/banners/logo-nap-tien.jpg" alt="Nạp tiền" className="w-6 h-6 object-contain" />
                <h3 className="text-lg font-semibold text-slate-900">Nạp tiền</h3>
              </div>
              <button onClick={() => setShowDeposit(false)} className="text-slate-400 text-xl">�?/button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">S�?tiền muốn nạp (USD)</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="VD: 100"
                min="50"
                max="10000"
                step="0.01"
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 text-slate-900 text-lg font-semibold focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-slate-600 mt-2">Tối thiểu: $50 �?Tối đa: $10,000</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-900 font-medium mb-1">📝 Quy trình nạp tiền:</p>
              <ol className="text-xs text-blue-800 space-y-1 ml-3 list-decimal">
                <li>Nhập s�?tiền và xác nhận</li>
                <li>CSKH s�?cung cấp thông tin chuyển khoản</li>
                <li>Chuyển khoản theo hướng dẫn</li>
                <li>Tiền v�?tài khoản sau 5-15 phút</li>
              </ol>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowDeposit(false)}
                className="flex-1 py-3 rounded-lg bg-slate-200 text-slate-700 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleDepositConfirm}
                className="flex-1 py-3 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal - 2 Steps */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <img src="/banners/logo-rut-tien.jpg" alt="Rút tiền" className="w-6 h-6 object-contain" />
                <h3 className="text-base font-semibold text-slate-900">
                  {withdrawStep === 1 ? "Rút tiền t�?ví" : "Chọn phương thức"}
                </h3>
              </div>
              <button onClick={() => setShowWithdraw(false)} className="text-slate-400 text-lg">�?/button>
            </div>

            {/* Step 1: Enter Amount */}
            {withdrawStep === 1 && (
              <>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">S�?tiền muốn rút (USD)</label>
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
                    <p className="text-[10px] text-slate-500">Tối thiểu: $50 �?Tối đa: $10,000</p>
                    <p className="text-[10px] text-green-600 font-medium">Kh�?dụng: {formatCurrency(balance)}</p>
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
                    <li>�?Hạn mức/ngày: $10,000</li>
                    <li>�?Thời gian x�?lý: 1-24 gi�?/li>
                    <li>�?Phí rút tiền: 0% (Miễn phí)</li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setShowWithdraw(false)} className="flex-1 py-2 rounded-lg bg-slate-200 text-slate-700 text-sm font-medium">Hủy</button>
                  <button onClick={handleWithdrawAmountConfirm} className="flex-1 py-2 rounded-full bg-green-500 text-white text-sm font-medium">Tiếp tục �?/button>
                </div>
              </>
            )}

            {/* Step 2: Select Method */}
            {withdrawStep === 2 && (
              <>
                <div className="rounded-lg bg-green-50 p-2.5 mb-3">
                  <p className="text-xs text-green-900 font-semibold">S�?tiền rút: {formatCurrency(Number(withdrawAmount))}</p>
                </div>

                <p className="text-xs font-medium text-slate-700 mb-2">Chọn tài khoản/ví nhận tiền:</p>

                {bankCards.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] text-slate-500 mb-1.5">🏦 Th�?ngân hàng</p>
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
                            {selectedBankCard === card.id && <span className="text-blue-600 text-lg">�?/span>}
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
                            {selectedUSDTWallet === wallet.id && <span className="text-green-600 text-lg">�?/span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <button onClick={() => setWithdrawStep(1)} className="flex-1 py-2 rounded-lg bg-slate-200 text-slate-700 text-sm font-medium">�?Quay lại</button>
                  <button
                    onClick={handleWithdrawFinalConfirm}
                    disabled={!selectedWithdrawMethod}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${selectedWithdrawMethod ? "bg-green-500 text-white" : "bg-slate-300 text-slate-500 cursor-not-allowed"}`}
                  >
                    Xác nhận rút
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bank Manager Modal */}
      {showBankManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">🏦 Quản lý ngân hàng</h3>
              <button onClick={() => setShowBankManager(false)} className="text-slate-400 text-xl">�?/button>
            </div>

            <div className="space-y-2 mb-4">
              {bankCards.map(card => (
                <div key={card.id} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{card.bankName}</p>
                      <p className="text-xs text-slate-600 font-mono mt-1">{card.accountNumber}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{card.accountName}</p>
                    </div>
                    <button onClick={() => handleDeleteBank(card.id)} className="text-red-600 text-sm">🗑�?/button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => { setShowBankManager(false); setShowAddBank(true); }}
              className="w-full py-3 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600"
            >
              + Thêm th�?ngân hàng
            </button>
          </div>
        </div>
      )}

      {/* Add Bank Modal */}
      {showAddBank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Thêm th�?ngân hàng</h3>
            <form onSubmit={handleAddBankSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên ngân hàng</label>
                <input name="bankName" required className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm" placeholder="VD: Vietcombank" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">S�?tài khoản</label>
                <input name="accountNumber" required className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm font-mono" placeholder="VD: 1234567890" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ch�?tài khoản</label>
                <input name="accountName" required className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm" placeholder="VD: NGUYEN VAN A" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAddBank(false)} className="flex-1 py-2 rounded-lg bg-slate-200 text-slate-700 font-medium">Hủy</button>
                <button type="submit" className="flex-1 py-2 rounded-full bg-blue-500 text-white font-semibold">Thêm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USDT Manager Modal */}
      {showUSDTManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">�?Quản lý ví USDT</h3>
              <button onClick={() => setShowUSDTManager(false)} className="text-slate-400 text-xl">�?/button>
            </div>

            <div className="space-y-2 mb-4">
              {usdtWallets.map(wallet => (
                <div key={wallet.id} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{wallet.network}</p>
                      <p className="text-xs text-slate-600 font-mono mt-1 break-all">{wallet.address}</p>
                    </div>
                    <button onClick={() => handleDeleteUSDT(wallet.id)} className="text-red-600 text-sm ml-2">🗑�?/button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => { setShowUSDTManager(false); setShowAddUSDT(true); }}
              className="w-full py-3 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600"
            >
              + Thêm ví USDT
            </button>
          </div>
        </div>
      )}

      {/* Add USDT Modal */}
      {showAddUSDT && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Thêm ví USDT</h3>
            <form onSubmit={handleAddUSDTSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Network</label>
                <select name="network" required className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm">
                  <option value="TRC20">TRC20 (Tron)</option>
                  <option value="ERC20">ERC20 (Ethereum)</option>
                  <option value="BEP20">BEP20 (BSC)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Địa ch�?ví</label>
                <input name="address" required className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs font-mono" placeholder="VD: TXs8fK3Jx...9kL2mP4n" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAddUSDT(false)} className="flex-1 py-2 rounded-lg bg-slate-200 text-slate-700 font-medium">Hủy</button>
                <button type="submit" className="flex-1 py-2 rounded-full bg-green-500 text-white font-semibold">Thêm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SupportView: React.FC<any> = ({ onBack, onContactSupport }) => (
  <div className="flex-1 overflow-y-auto pb-24 bg-slate-100">
    <div className="sticky top-0 z-10 bg-white border-b">
      <div className="flex items-center gap-3 px-4 py-4">
        <button onClick={onBack} className="w-8 h-8"><svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
        <h1 className="text-lg font-semibold text-slate-900">H�?tr�?& FAQ</h1>
      </div>
    </div>
    <div className="p-4 space-y-3">
      <button onClick={onContactSupport} className="w-full bg-blue-500 text-white rounded-full p-4 font-semibold shadow-md hover:bg-blue-600 flex items-center justify-center gap-2">
        <img src="/banners/Logo-cskh.jpg" alt="CSKH" className="w-6 h-6 object-contain" />
        <span>Chat với CSKH</span>
      </button>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-3">Câu hỏi thường gặp</h3>
        <div className="space-y-2 text-sm">
          <details><summary className="font-medium text-slate-900 cursor-pointer">Làm sao đ�?nạp tiền?</summary><p className="text-xs text-slate-700 mt-2">Vào mục Ví �?Nạp tiền �?Nhập s�?tiền �?Liên h�?CSKH</p></details>
          <details><summary className="font-medium text-slate-900 cursor-pointer">Thời gian x�?lý rút tiền?</summary><p className="text-xs text-slate-700 mt-2">1-24 gi�?làm việc</p></details>
        </div>
      </div>
    </div>
  </div>
);

const RewardsView: React.FC<any> = ({ points, totalPoints, userLevel, onBack }) => (
  <div className="flex-1 overflow-y-auto pb-24 bg-slate-100">
    <div className="sticky top-0 z-10 bg-white border-b">
      <div className="flex items-center gap-3 px-4 py-4">
        <button onClick={onBack} className="w-8 h-8"><svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
        <h1 className="text-lg font-semibold text-slate-900">Điểm thưởng</h1>
      </div>
    </div>
    <div className="p-4">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white mb-4 shadow-md">
        <p className="text-sm opacity-90">Tổng điểm hiện tại</p>
        <p className="text-3xl font-bold">{totalPoints}</p>
        <p className="text-xs opacity-75 mt-2">Cấp đ�? Level {userLevel}</p>
      </div>
      <h3 className="font-semibold text-slate-900 mb-3">Lịch s�?điểm</h3>
      <div className="space-y-2">
        {points.map((p: RewardPoint) => (
          <div key={p.id} className="bg-white rounded-xl p-3 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-sm font-medium text-slate-900">{p.description}</p>
              <p className="text-xs text-slate-600">{p.date}</p>
            </div>
            <p className={`font-bold ${p.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
              {p.type === 'earn' ? '+' : ''}{p.amount}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const VersionView: React.FC<any> = ({ onBack, onCheckUpdate }) => (
  <div className="flex-1 overflow-y-auto pb-24 bg-slate-100">
    <div className="sticky top-0 z-10 bg-white border-b">
      <div className="flex items-center gap-3 px-4 py-4">
        <button onClick={onBack} className="w-8 h-8"><svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
        <h1 className="text-lg font-semibold text-slate-900">Phiên bản</h1>
      </div>
    </div>
    <div className="p-4 text-center">
      <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
        <span className="text-4xl">📱</span>
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">SCLM Global App</h2>
      <p className="text-3xl font-bold text-blue-600 mb-4">v1.0.0</p>
      <div className="bg-white rounded-xl p-4 text-left mb-4 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-2">Cập nhật mới nhất</h3>
        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
          <li>Tối ưu hiệu suất ứng dụng</li>
          <li>Thêm tính năng quản lý cửa hàng</li>
          <li>Cải thiện giao diện người dùng</li>
          <li>Sửa lỗi nh�?/li>
        </ul>
      </div>
      <button onClick={onCheckUpdate} className="w-full py-3 bg-blue-500 text-white rounded-full font-semibold shadow-md hover:bg-blue-600">
        Kiểm tra cập nhật
      </button>
    </div>
  </div>
);

export default ProfileScreen;
