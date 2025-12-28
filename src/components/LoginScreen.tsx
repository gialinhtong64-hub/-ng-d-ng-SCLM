import React, { useState, useEffect } from "react";
import { loginUser } from "../supabaseApi";
import { useLanguage } from "../i18n/LanguageContext";
import LanguageSelector from "../i18n/LanguageSelector";

interface LoginScreenProps {
  onLogin: (userData: any) => void;
  onRegister: () => void;
}

const USERS_KEY = "sclm_users_v1";

// Banner images from public folder
const BANNERS = [
  { id: 1, url: "/banners/banner1.jpg", alt: "Banner 1" },
  { id: 2, url: "/banners/banner2.jpg", alt: "Banner 2" },
  { id: 3, url: "/banners/banner3.jpg", alt: "Banner 3" },
  { id: 4, url: "/banners/banner4.jpg", alt: "Banner 4" },
  { id: 5, url: "/banners/banner5.jpg", alt: "Banner 5" },
  { id: 6, url: "/banners/banner6.jpg", alt: "Banner 6" },
];

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onRegister }) => {
  const { t } = useLanguage();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Auto-rotate banners
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!username.trim() || !password.trim()) {
      alert(`❌ ${t.messages.loginEmptyFields}`);
      return;
    }

    // 🔥 ĐĂNG NHẬP QUA SUPABASE - Đồng bộ với backend
    console.log('🔐 Đang đăng nhập qua Supabase...');
    const result = await loginUser(username.trim(), password);

    if (!result.success) {
      if (result.error?.includes('not found')) {
        alert(`❌ ${t.messages.loginUserNotFound}`);
      } else if (result.error?.includes('password')) {
        alert(`❌ ${t.messages.loginWrongPassword}`);
      } else if (result.error?.includes('suspended')) {
        alert(`⚠️ ${t.status.suspended}!`);
      } else if (result.error?.includes('inactive')) {
        alert(`⚠️ ${t.status.inactive}!`);
      } else {
        alert(`❌ ${t.common.error}!\n\n${result.error}`);
      }
      return;
    }

    console.log('✅ Đăng nhập Supabase thành công:', result.user);

    // Lấy user từ Supabase
    const user = result.user;
    if (!user) {
      alert(`❌ ${t.common.error}! ${t.messages.noData}`);
      return;
    }

    // Tạo session token mới
    const newSessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 💾 CẬP NHẬT LOCALSTORAGE - Đồng bộ với Supabase
    const usersData = localStorage.getItem(USERS_KEY);
    const users = usersData ? JSON.parse(usersData) : [];
    
    // Tìm user trong localStorage, nếu không có thì thêm mới
    const existingUserIndex = users.findIndex((u: any) => u.username === username.trim());
    const userWithSession = {
      ...user,
      sessionToken: newSessionToken,
      lastLoginTime: new Date().toISOString(),
      // Legacy fields for backward compatibility
      id: String((user as any).uid),
      balance: (user as any).wallet_balance || (user as any).walletBalance || 0,
      walletBalance: (user as any).wallet_balance || (user as any).walletBalance || 0
    };
    
    if (existingUserIndex >= 0) {
      users[existingUserIndex] = userWithSession;
    } else {
      users.push(userWithSession);
    }
    
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Lưu session info
    localStorage.setItem('sclm_current_session', newSessionToken);
    localStorage.setItem('sclm_current_user_id', String((user as any).uid));

    // Login successful
    alert(`✅ ${t.messages.loginSuccess}\n\n👋 ${t.common.welcome} ${(user as any).full_name || (user as any).fullName || username}!`);
    onLogin(userWithSession);
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      {/* Language Selector - Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSelector />
      </div>
      
      {/* Header with banner carousel */}
      <div className="relative h-[45%] bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 overflow-hidden">
        {/* Banner images with animation */}
        <div className="absolute inset-0">
          {BANNERS.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentBanner 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-110'
              }`}
            >
              <img
                src={banner.url}
                alt={banner.alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/30 to-slate-900/80" />
            </div>
          ))}
        </div>

        {/* Banner indicators */}
        <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2 z-10">
          {BANNERS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentBanner 
                  ? 'w-8 bg-white' 
                  : 'w-1.5 bg-white/40'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>

        {/* Decorative wave layers */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path 
              fill="rgba(148, 163, 184, 0.3)" 
              fillOpacity="1" 
              d="M0,160L48,144C96,128,192,96,288,90.7C384,85,480,107,576,128C672,149,768,171,864,165.3C960,160,1056,128,1152,122.7C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
          <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path 
              fill="rgba(226, 232, 240, 0.5)" 
              fillOpacity="1" 
              d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,234.7C672,245,768,235,864,218.7C960,203,1056,181,1152,181.3C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
          <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path 
              fill="#f8fafc" 
              fillOpacity="1" 
              d="M0,256L48,240C96,224,192,192,288,181.3C384,171,480,181,576,192C672,203,768,213,864,208C960,203,1056,181,1152,170.7C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
        </div>

        {/* Globe icon - top right */}
        <button 
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 backdrop-blur-sm"
          aria-label="Change language"
          title="Thay đổi ngôn ngữ"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col items-center justify-between px-6 pb-8 pt-6 bg-gradient-to-b from-slate-50 to-white">
        {/* Logo/Brand */}
        <div className="text-center">
          <h1 className="text-4xl font-light tracking-[0.3em] text-slate-500 italic">
            SCLM
          </h1>
        </div>

        {/* Buttons */}
        <div className="w-full max-w-[340px] space-y-3">
          <button
            onClick={() => setShowLoginForm(true)}
            className="w-full py-4 rounded-full bg-gradient-to-r from-slate-500 to-slate-600 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
          >
            {t.auth.login}
          </button>
          
          <button
            onClick={onRegister}
            className="w-full py-4 rounded-full bg-white border-2 border-slate-400 text-slate-700 font-medium text-base shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          >
            {t.auth.register}
          </button>
        </div>

        {/* Company Info Footer */}
        <div className="w-full max-w-[340px] mt-8">
          <div className="text-center space-y-1.5 text-slate-600">
            <p className="text-[11px] font-semibold">SCLM GLOBAL</p>
            <p className="text-[9px]">Hệ thống chuỗi cung ứng toàn cầu</p>
            
            <div className="border-t border-slate-300 my-2 mx-8"></div>
            
            <div className="space-y-0.5 text-[8px] text-slate-500">
              <p>Tên quốc tế viết tắt: SCM TM DV CO., LTD</p>
              <p>Số đăng ký: 0110367441</p>
              <p>Hotline: 0582-779-977 | Email: contact@sclm.vn</p>
            </div>
            
            <div className="border-t border-slate-300 my-2 mx-8"></div>
            
            <div className="text-[8px] text-slate-400">
              <p>© 2025 SCLM Global.</p>
              <p>All Rights Reserved.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form Modal */}
      {showLoginForm && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-slate-600 to-slate-700 p-6 rounded-t-3xl">
              <button
                onClick={() => {
                  setShowLoginForm(false);
                  setUsername("");
                  setPassword("");
                  setShowPassword(false);
                }}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <span className="text-white text-xl font-bold">×</span>
              </button>
              
              <div className="flex items-center justify-center mb-3">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-white text-center mb-1">{t.auth.login}</h2>
              <p className="text-slate-200 text-center text-sm">{t.common.welcome}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="p-6 space-y-5">
              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {t.auth.username}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t.auth.username}
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-200 outline-none transition-all text-slate-900"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {t.auth.password}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.auth.password}
                    className="w-full pl-12 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-200 outline-none transition-all text-slate-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-slate-600 focus:ring-slate-500" />
                  <span className="text-slate-600">{t.auth.rememberMe}</span>
                </label>
                <button type="button" className="text-slate-600 hover:text-slate-800 font-medium">
                  {t.auth.forgotPassword}
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-slate-500 to-slate-600 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
              >
                {t.auth.login}
              </button>

              {/* Register Link */}
              <div className="text-center text-sm text-slate-600">
                {t.auth.register}?{" "}
                <button 
                  type="button"
                  onClick={() => {
                    setShowLoginForm(false);
                    onRegister();
                  }}
                  className="text-slate-700 font-semibold hover:text-slate-900"
                >
                  {t.auth.register}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;
