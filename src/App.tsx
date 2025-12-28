import React, { useState, useEffect } from "react";
import { TabKey } from "./types";
import { MOCK_PRODUCTS } from "./data";
import HomeScreen from "./components/HomeScreen";
import WalletScreen from "./components/WalletScreen";
import PhoneFrame from "./components/PhoneFrame";
import {
  mockBankCards,
  mockUSDTWallets,
  mockTransactions,
  mockFinancialData,
  mockSecuritySettings,
  mockLoginLogs
} from "./logic/wallet";
import OrdersScreen from "./components/OrdersScreen";
import ProfileScreen from "./components/ProfileScreen";
import BottomNav from "./components/BottomNav";
import LoginScreen from "./components/LoginScreen";
import RegisterScreen from "./components/RegisterScreen";
import BankerDashboard from "./components/BankerDashboard";
import { LanguageProvider } from "./i18n/LanguageContext";
import LanguageSelector from "./i18n/LanguageSelector";
import { startRealtimeSync } from "./realtimeSync";

// 🔥 HỆ THỐNG SCLM - BACKEND QUYẾT ĐỊNH, APP HIỂN THỊ
// ⚠️ ĐỒNG BỘ VỚI BANKER - Dùng chung localStorage key
const USERS_KEY = "sclm_users_v1";

// 🔧 MIGRATION: Chuyển đổi dữ liệu cũ sang format mới
const migrateUserData = (user: any) => {
  // Nếu đã có uid (5 số), giữ nguyên, không migrate lại
  if (user.uid && /^[0-9]{5}$/.test(String(user.uid))) return user;
  // Nếu có id là 5 số, dùng làm uid
  if (user.id && /^[0-9]{5}$/.test(user.id)) {
    return {
      ...user,
      uid: parseInt(user.id),
      walletBalance: user.balance || 0,
      orderQuotaMax: user.orderQuotaMax || 0,
      orderQuotaUsed: user.orderQuotaUsed || 0,
      pendingOrders: user.pendingOrders || 0,
      totalCommission: user.totalCommission || 0,
      registerTime: user.registrationDate ? new Date(user.registrationDate).toISOString() : new Date().toISOString()
    };
  }
  // Nếu không có, sinh mới 5 số (chỉ dùng cho dữ liệu cũ, không dùng cho đăng ký mới)
  return {
    ...user,
    uid: Math.floor(10000 + Math.random() * 90000),
    walletBalance: user.balance || 0,
    orderQuotaMax: user.orderQuotaMax || 0,
    orderQuotaUsed: user.orderQuotaUsed || 0,
    pendingOrders: user.pendingOrders || 0,
    totalCommission: user.totalCommission || 0,
    registerTime: user.registrationDate ? new Date(user.registrationDate).toISOString() : new Date().toISOString()
  };
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const products = MOCK_PRODUCTS;
  
  // 📊 DỮ LIỆU TÀI KHOẢN - CHỈ ĐỌC TỪ BACKEND (Banker quản lý)
  const [balance, setBalance] = useState(0);              // walletBalance
  const [frozen, setFrozen] = useState(0);
  const [vipLevel, setVipLevel] = useState("VIP0");       // vipLevel (default VIP0)
  const [vipPoints, setVipPoints] = useState(0);          // ⭐ MỚI - VIP points
  const [depositPoints, setDepositPoints] = useState(0);
  const [accountName, setAccountName] = useState("");
  const [creditScore, setCreditScore] = useState(10);            // ⭐ MỚI - Điểm tín dụng
  const [totalCommission, setTotalCommission] = useState(0);    // ⭐ MỚI
  const [orderQuotaMax, setOrderQuotaMax] = useState(0);        // ⭐ MỚI
  const [orderQuotaUsed, setOrderQuotaUsed] = useState(0);      // ⭐ MỚI
  const [pendingOrders, setPendingOrders] = useState(0);        // ⭐ MỚI
  const [notifications, setNotifications] = useState<any[]>([]); // ⭐ REALTIME notifications
  const [avatarUrl, setAvatarUrl] = useState("https://images.pexels.com/photos/3184396/pexels-photo-3184396.jpeg?auto=compress&cs=tinysrgb&w=1600");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showRegister, setShowRegister] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // Luôn đồng bộ accountName với currentUser nếu có (chỉ giữ 1 useEffect duy nhất)
  useEffect(() => {
    if (currentUser) {
      setAccountName(currentUser.username || currentUser.fullName || currentUser.name || "");
    }
  }, [currentUser]);
  const [openSettingsFromHome, setOpenSettingsFromHome] = useState<boolean>(false);
  const [accountStatus, setAccountStatus] = useState<"active" | "inactive" | "suspended">("active");

  // CSKH contact - Open chat widget
  const CSKH_LINK = "https://chatlink.ichatlinks.net/widget/standalone.html?eid=f06e847ab6e5b72774424ffe3fea3f46&language=en";
  
  const handleCSKH = () => {
    window.open(CSKH_LINK, '_blank', 'width=400,height=600');
  };

  const handleProfile = () => {
    setActiveTab("profile");
  };

  const handleOpenSettings = () => {
    setOpenSettingsFromHome(true);
    setActiveTab("profile");
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      setIsLoggedIn(false);
      setActiveTab("home");
      setCurrentUser(null);
      // Chỉ xóa session khi user chủ động đăng xuất
      localStorage.removeItem('sclm_current_session');
      localStorage.removeItem('sclm_current_user_id');
    }
  };

  // 🔐 AUTO-LOGIN: Tự động đăng nhập lại khi mở app
  useEffect(() => {
    const savedUserId = localStorage.getItem('sclm_current_user_id');
    const savedSession = localStorage.getItem('sclm_current_session');
    
    if (savedUserId && savedSession && !isLoggedIn) {
      // Có thông tin đăng nhập được lưu → Tự động đăng nhập lại
      const usersData = localStorage.getItem(USERS_KEY);
      if (usersData) {
        try {
          const users = JSON.parse(usersData);
          const savedUser = users.find((u: any) => u.id === savedUserId || u.uid?.toString() === savedUserId);
          
          if (savedUser) {
            // Kiểm tra session token
            if (savedUser.sessionToken && savedUser.sessionToken === savedSession) {
              // Session hợp lệ → Đăng nhập tự động
              const userData = migrateUserData(savedUser);
              setIsLoggedIn(true);
              setCurrentUser(userData);
              setAccountName(userData.fullName || userData.name || userData.username);
              setBalance(userData.walletBalance ?? userData.balance ?? 0);
              setVipLevel(userData.vipLevel || "VIP1");
              setCreditScore(userData.creditScore || 10);
              setTotalCommission(userData.totalCommission || 0);
              setOrderQuotaMax(userData.orderQuotaMax || 0);
              setOrderQuotaUsed(userData.orderQuotaUsed || 0);
              setPendingOrders(userData.pendingOrders || 0);
              setAccountStatus(userData.status || "active");
              console.log("✅ Auto-login successful:", userData.username);
            } else {
              // Session không khớp → Xóa thông tin cũ
              localStorage.removeItem('sclm_current_session');
              localStorage.removeItem('sclm_current_user_id');
            }
          }
        } catch (e) {
          console.error("Auto-login error:", e);
        }
      }
    }
  }, []); // Chỉ chạy 1 lần khi app mount


  // ⚡ REALTIME SUPABASE SYNCHRONIZATION - Polling mỗi 2-3 giây
  useEffect(() => {
    if (!isLoggedIn || !currentUser?.uid) return;

    console.log("🔄 Starting realtime Supabase sync for user:", currentUser.uid);

    const cleanup = startRealtimeSync(currentUser.uid, {
      // 📬 Notifications callback (mỗi 3 giây)
      onNotifications: (newNotifications) => {
        console.log("📬 Notifications updated:", newNotifications.length);
        setNotifications(newNotifications);
      },

      // 💰 Transactions callback (mỗi 2 giây)
      onTransactions: (data) => {
        console.log("💰 Transactions updated:", data);
        // Cập nhật số lượng pending orders từ transaction_requests
        const pendingCount = data.deposits.filter((d: any) => d.status === 'pending').length + 
                           data.withdraws.filter((w: any) => w.status === 'pending').length;
        setPendingOrders(pendingCount);
      },

      // 💵 Balance callback (mỗi 2 giây)
      onBalance: (balanceData) => {
        if (!balanceData) return;
        console.log("💵 Balance updated:", balanceData);
        
        // Cập nhật toàn bộ thông tin user từ Supabase
        setBalance(balanceData.walletBalance || 0);
        setVipLevel(balanceData.vipLevel || "VIP0");
        setVipPoints(balanceData.vipPoints || 0);
        setCreditScore(balanceData.creditScore || 10);
        setTotalCommission(balanceData.totalCommission || 0);
        setOrderQuotaMax(balanceData.orderQuotaMax || 0);
        setOrderQuotaUsed(balanceData.orderQuotaUsed || 0);
        setAccountStatus(balanceData.status || "active");
      }
    });

    // Cleanup khi unmount hoặc logout
    return cleanup;
  }, [isLoggedIn, currentUser?.uid]);

  // Check if accessing banker dashboard via URL
  const isBankerRoute = window.location.pathname === "/banker" || window.location.hash === "#banker";

  // Banker Dashboard (Full screen, no mobile frame)
  if (isBankerRoute) {
    return <BankerDashboard />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-50 p-6">
      <PhoneFrame
        bottomNav={
          <BottomNav 
            active={activeTab} 
            onChange={setActiveTab}
            onCSKH={handleCSKH}
            onProfile={handleProfile}
          />
        }
      >
        { !isLoggedIn ? (
          showRegister ? (
            <RegisterScreen onComplete={(data) => { 
              console.log("🎉 RegisterScreen onComplete triggered!", data);
              setIsLoggedIn(true); 
              setShowRegister(false);
              
              // 🔧 Migrate dữ liệu nếu cần
              const userData = migrateUserData(data);
              console.log("📊 User data after migration:", userData);
              setCurrentUser(userData); 
              setAccountName(userData.fullName || userData.name || userData.username);
              
              // 📊 Load TẤT CẢ thông tin từ tài khoản mới (Backend standard)
              setBalance(userData.walletBalance ?? userData.balance ?? 0);
              setVipLevel(userData.vipLevel || "VIP0");  // ⭐ Default VIP0
              setCreditScore(userData.creditScore || 10);
              setTotalCommission(userData.totalCommission || 0);
              setOrderQuotaMax(userData.orderQuotaMax || 0);
              setOrderQuotaUsed(userData.orderQuotaUsed || 0);
              setPendingOrders(userData.pendingOrders || 0);
              setDepositPoints(0);
              setAccountStatus(userData.status || "active");
              console.log("✅ All states updated, switching to HomeScreen");
            }} />
          ) : (
            <LoginScreen 
              onLogin={(userData) => {
                setIsLoggedIn(true);
                
                // 🔧 Migrate dữ liệu nếu cần
                const migratedData = migrateUserData(userData);
                setCurrentUser(migratedData);
                setAccountName(migratedData.fullName || migratedData.name || migratedData.username);
                
                // 📊 Load TẤT CẢ thông tin từ Backend (Banker quản lý)
                setBalance(migratedData.walletBalance ?? migratedData.balance ?? 0);
                setVipLevel(migratedData.vipLevel || "VIP0");  // ⭐ Default VIP0
                setCreditScore(migratedData.creditScore || 10);
                setTotalCommission(migratedData.totalCommission || 0);
                setOrderQuotaMax(migratedData.orderQuotaMax || 0);
                setOrderQuotaUsed(migratedData.orderQuotaUsed || 0);
                setPendingOrders(migratedData.pendingOrders || 0);
                setDepositPoints(0);
                setAccountStatus(migratedData.status || "active");
              }}
              onRegister={() => setShowRegister(true)}
            />
          )
        ) : (
          <div className="absolute inset-0 flex flex-col">
            {/* Header with Language Selector */}
            <div className="h-10 px-4 flex items-center justify-between bg-slate-950/95 border-b border-slate-800">
              <span className="text-xs text-slate-400 font-medium">SCLM App</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  📶 🔋
                </span>
                <LanguageSelector />
              </div>
            </div>

            {activeTab === "home" && (
              <HomeScreen 
                products={products} 
                balance={balance} 
                vipLevel={vipLevel} 
                accountName={accountName} 
                avatarUrl={avatarUrl} 
                onOpenSettings={handleOpenSettings}
                creditScore={creditScore}
                totalCommission={totalCommission}
                orderQuotaMax={orderQuotaMax}
                orderQuotaUsed={orderQuotaUsed}
                pendingOrders={pendingOrders}
              />
            )}
            {activeTab === "wallet" && (
              <WalletScreen
                balance={balance}
                frozen={frozen}
                depositPoints={depositPoints}
                totalCommission={totalCommission}
                vipLevel={vipLevel}
                vipPoints={vipPoints}
                creditScore={creditScore}
                orderQuotaMax={orderQuotaMax}
                orderQuotaUsed={orderQuotaUsed}
                username={currentUser?.username || ""}
                fullName={currentUser?.fullName || currentUser?.name || ""}
                uid={currentUser?.uid}
                bankCards={mockBankCards}
                usdtWallets={mockUSDTWallets}
                transactions={mockTransactions}
                financialData={mockFinancialData}
                securitySettings={mockSecuritySettings}
                loginLogs={mockLoginLogs}
              />
            )}
            {activeTab === "orders" && (
              <OrdersScreen 
                products={products} 
                balance={balance} 
                vipLevel={vipLevel} 
                accountName={accountName}
                orderQuotaMax={orderQuotaMax}
                orderQuotaUsed={orderQuotaUsed}
                pendingOrders={pendingOrders}
                totalCommission={totalCommission}
              />
            )}
            {activeTab === "profile" && (
              <ProfileScreen 
                accountName={accountName}
                avatarUrl={avatarUrl}
                balance={balance}
                frozen={frozen}
                userId="10"
                onLogout={handleLogout}
                autoOpenSettings={openSettingsFromHome}
                onCloseSettings={() => setOpenSettingsFromHome(false)}
                notifications={notifications}
                vipPoints={vipPoints}
                vipLevel={vipLevel}
                creditScore={creditScore}
              />
            )}

            <BottomNav 
              active={activeTab} 
              onChange={setActiveTab}
              onCSKH={handleCSKH}
              onProfile={handleProfile}
            />
          </div>
        )}
      </PhoneFrame>
    </div>
  );
};

// Wrap App with LanguageProvider
const AppWithLanguage: React.FC = () => {
  return (
    <LanguageProvider>
      <App />
    </LanguageProvider>
  );
};

export default AppWithLanguage;
