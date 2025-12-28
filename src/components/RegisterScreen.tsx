
import { createUserSafe } from "../logic/userSync";
import { useState } from "react";
import { supabase } from "../supabase";
import { useLanguage } from "../i18n/LanguageContext";
import LanguageSelector from "../i18n/LanguageSelector";
import BottomNav from "./BottomNav";
import type { TabKey } from "../types";

// 🔥 USER MODEL - ĐỒNG BỘ VỚI BACKEND SPECIFICATION
type User = { 
  // Primary fields
  user_id?: number;               // User ID (number) - Backend standard
  id?: number;                    // ID number (chuẩn backend, 5 số)
  username: string;               // Tên đăng nhập
  password: string;               // Mật khẩu
  
  // Profile info
  fullName?: string;              // Họ tên đầy đủ
  name?: string;                  // Tên (legacy)
  phone?: string;                 // Số điện thoại
  email?: string;                 // Email
  
  // Financial - CHỈ BANKER QUẢN LÝ
  walletBalance?: number;         // Số dư ví (thay thế balance)
  balance?: number;               // Legacy balance field
  totalCommission?: number;       // Tổng chiết khấu - BANKER TÍNH
  
  // Orders quota - CHỈ BANKER QUẢN LÝ  
  orderQuotaMax?: number;         // Số đơn tối đa - BANKER ĐẶT
  orderQuotaUsed?: number;        // Số đơn đã dùng - BANKER TÍNH
  pendingOrders?: number;         // Số đơn chưa giải quyết - BANKER TÍNH
  totalOrders?: number;           // Legacy total orders
  
  // Account info
  vipLevel?: string;              // Cấp VIP - BANKER QUẢN LÝ
  creditScore?: number;           // Điểm tín dụng
  status?: "active" | "inactive" | "suspended"; // Trạng thái - BANKER QUẢN LÝ
  
  // Security
  authCode?: string;              // Mã ủy quyền
  withdrawalPassword?: string;    // Mật khẩu rút tiền
  
  // Timestamps
  registerTime?: string;          // Thời gian đăng ký (ISO format)
  registrationDate?: string;      // Legacy registration date
};

const USERS_KEY = "sclm_users_v1";

function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves the given array of users to localStorage under the USERS_KEY.
 * @param u Array of User objects to be saved.
 */
function saveUsers(u: User[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(u));
  } catch {}
}

// 🔑 10 MÃ ỦY QUYỀN MỚI - Chỉ có 10 mã này mới được đăng ký
const AUTHORIZATION_CODES = [
  "SCLM2025A1",
  "SCLM2025B2",
  "SCLM2025C3",
  "SCLM2025D4",
  "SCLM2025E5",
  "SCLM2025F6",
  "SCLM2025G7",
  "SCLM2025H8",
  "SCLM2025I9",
  "SCLM2025J0"
];

const RegisterScreen: React.FC<{ onComplete: (data: User) => void }> = ({ onComplete }) => {
  // State cho tab bottom nav
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const { t } = useLanguage();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [transactionPassword, setTransactionPassword] = useState("");
  const [authorizationCode, setAuthorizationCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [agree, setAgree] = useState(true);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const u = (username ?? "").trim();
    console.log("DEBUG username state:", username, "=> u:", u);
    if (!u) {
      alert("Thiếu username");
      return;
    }
    // Kiểm tra tên đăng nhập và mật khẩu
    if (!password) {
      alert("❌ Vui lòng nhập mật khẩu đăng nhập.");
      return;
    }
    // Kiểm tra xác nhận mật khẩu
    if (password !== confirmPassword) {
      alert("❌ Mật khẩu xác nhận không khớp!\n\nVui lòng nhập lại cho khớp với mật khẩu đăng nhập.");
      return;
    }
    // Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      alert("❌ Mật khẩu đăng nhập quá ngắn!\n\nMật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    // Kiểm tra mật khẩu giao dịch (cũng dùng cho rút tiền)
    if (!transactionPassword) {
      alert("❌ Vui lòng nhập mật khẩu giao dịch!");
      return;
    }
    if (!/^\d{6}$/.test(transactionPassword)) {
      alert("❌ Mật khẩu giao dịch không hợp lệ!\n\nMật khẩu giao dịch phải là 6 chữ số.");
      return;
    }
    // ✅ KIỂM TRA MÃ ỦY QUYỀN - BẮT BUỘC
    if (!authorizationCode.trim()) {
      alert("❌ Vui lòng nhập mã ủy quyền!\n\nMã ủy quyền là bắt buộc để đăng ký tài khoản.");
      return;
    }
    if (!AUTHORIZATION_CODES.includes(authorizationCode.trim().toUpperCase())) {
      alert("❌ Mã ủy quyền không hợp lệ!\n\n💡 Vui lòng nhập 1 trong 10 mã ủy quyền hợp lệ:\n" + AUTHORIZATION_CODES.join("\n"));
      return;
    }
    const users = loadUsers();
    if (users.find((x) => x.username === u)) {
      alert("❌ Tên đăng nhập đã tồn tại!\n\nVui lòng chọn tên đăng nhập khác.");
      return;
    }
    // Tạo session token cho lần đăng ký/đăng nhập này
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // 🔥 KHỞI TẠO TÀI KHOẢN MỚI - UID là số ngẫu nhiên 5 chữ số, cố định, không đổi
    // Sinh số ngẫu nhiên 5 chữ số, đảm bảo không trùng với user đã có
    let userId: number;
    do {
      userId = Math.floor(10000 + Math.random() * 90000); // 5 số, từ 10000 đến 99999
  } while (users.some((x) => x.user_id === userId));
    const user: User = {
      // IDs
      user_id: userId,                    // User ID (chuẩn backend, 5 số)
      id: userId,                         // ID number (chuẩn backend, 5 số)
      // Login credentials
      username: u,
      password,
      // Profile info
      fullName: name,
      name,
      phone,
      email,
      // Financial - BẮT ĐẦU TỪ 0 - CHỈ BANKER THAY ĐỔI
      walletBalance: 0,
      balance: 0,
      totalCommission: 0,
      // Orders quota - BẮT ĐẦU TỪ 0 - CHỈ BANKER ĐẶT
      orderQuotaMax: 0,
      orderQuotaUsed: 0,
      pendingOrders: 0,
      totalOrders: 0,
      // Account status
      vipLevel: "VIP0",
      creditScore: 10,
      status: "active",
      // Security
      authCode: authorizationCode.trim().toUpperCase(),
      withdrawalPassword: transactionPassword,
      // Timestamps
      registerTime: new Date().toISOString(),
      registrationDate: new Date().toISOString().split('T')[0]
    };
    // Tạo session token
    const newSessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // 🔥 ĐỒNG BỘ VỚI SUPABASE - QUAN TRỌNG!
    // Đảm bảo insert đúng field username, không phải accountName
    const payload = {
      username: u,
      password,
      email,
      phone,
      full_name: name
    };
    console.log("INSERT users payload:", payload);
    // Gọi registerUser với đúng kiểu tham số cũ (userId, accountName, email) để không lỗi type
    const syncResult = await createUserSafe({
      userId: userId,
      accountName: u,
      username: u,
      email,
      password
    });
    if (syncResult.error) {
      alert(`❌ Lỗi đồng bộ Supabase!\n\n${syncResult.error.message || syncResult.error}\n\n💡 Vui lòng thử lại hoặc liên hệ admin.`);
      return;
    }
    // Sau khi tạo user, fetch lại user từ Supabase để xác nhận đã có user
    const { data: userCheck, error: userCheckError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (!userCheck || userCheckError) {
      alert('❌ Đăng ký thất bại: Không tìm thấy user trên hệ thống!\nVui lòng thử lại hoặc liên hệ admin.');
      return;
    }
    // 🎯 LƯU VÀO LOCALSTORAGE - Dùng userId
    const userWithSession = {
      ...user,
      uid: userId,
      sessionToken: newSessionToken
    };
    const updatedUsers = [...users, userWithSession];
    saveUsers(updatedUsers);
    // Lưu session info
    localStorage.setItem('sclm_current_session', newSessionToken);
    localStorage.setItem('sclm_current_user_id', String(userId));
    alert(`✅ Đăng ký thành công!\n\n🎉 Chào mừng ${user.fullName || u} gia nhập SCLM!\n\n💡 Tài khoản của bạn đã được tạo với:\n- VIP Level: ${user.vipLevel}\n- Số dư: $${user.walletBalance}\n- Quota đơn hàng: ${user.orderQuotaMax}\n\n✨ Bạn có thể bắt đầu nhận đơn hàng ngay!`);
    onComplete(userWithSession as any);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const u = username.trim();
    if (!u || !password) {
      alert("Vui lòng nhập tên đăng nhập và mật khẩu.");
      return;
    }
    const users = loadUsers();
    const found = users.find((x) => x.username === u && x.password === password);
    if (!found) {
      alert("Tên đăng nhập hoặc mật khẩu không đúng.");
      return;
    }
    // Không bao giờ sinh lại uid, chỉ lấy uid đã lưu
    // Tạo session token mới
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // Cập nhật session token trong database
    const updatedUsers = users.map((user: any) => 
      user.id === found.id 
        ? { ...user, sessionToken, lastLoginTime: new Date().toISOString() }
        : user
    );
    saveUsers(updatedUsers);
    // Lưu session token
    localStorage.setItem('sclm_current_session', sessionToken);
  localStorage.setItem('sclm_current_user_id', String(found.id!));
    onComplete({ ...found, sessionToken } as any);
  };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div
          className="relative w-[390px] h-[844px] rounded-3xl shadow-2xl bg-slate-900 overflow-hidden flex flex-col justify-start custom-phone-frame"
        >
          {/* Language Selector - Top Right (inside phone frame) */}
          <div className="absolute top-4 right-4 z-50">
            <LanguageSelector />
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-4 py-8 pb-32"> {/* Thêm pb-32 để tránh bị che bởi nav */}
            <div className="w-full max-w-[360px] mx-auto bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-slate-700/50">
              <div className="flex flex-col items-center mb-6">
                <div className="h-28 w-28 rounded-full bg-white overflow-hidden flex items-center justify-center mb-4 shadow-lg ring-4 ring-slate-700/50">
                  <img
                    src="/logo-sclm.png"
                    alt="SCLM Logo"
                    className="h-full w-full object-cover"
                  />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{mode === "register" ? "Tạo tài khoản" : "Đăng nhập"}</h2>
                <p className="text-sm text-slate-400">{mode === "register" ? "Đăng ký để sử dụng giao diện mẫu" : "Đăng nhập vào cửa hàng mẫu"}</p>
              </div>

              {mode === "register" ? (
                <form onSubmit={handleRegister} className="space-y-3 pb-2">
                  {/* Tên đăng nhập */}
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Tên đăng nhập"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-700/70 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    required
                  />
                  {/* Mật khẩu đăng nhập */}
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu đăng nhập"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-700/70 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    required
                  />
                  {/* Xác nhận mật khẩu đăng nhập */}
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Xác nhận mật khẩu đăng nhập"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-700/70 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    required
                  />
                  {/* Mật khẩu giao dịch (dùng cho rút tiền) */}
                  <input
                    type="password"
                    value={transactionPassword}
                    onChange={(e) => setTransactionPassword(e.target.value)}
                    placeholder="Mật khẩu giao dịch (6 số) - Dùng cho rút tiền"
                    maxLength={6}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-700/70 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    required
                  />
                  {/* ✅ MÃ ỦY QUYỀN - BẮT BUỘC */}
                  <div className="relative">
                    <input
                      value={authorizationCode}
                      onChange={(e) => setAuthorizationCode(e.target.value)}
                      placeholder="MÃ ỦY QUYỀN (BẮT BUỘC)"
                      className="w-full px-4 py-3.5 rounded-xl bg-slate-700/70 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all uppercase font-medium tracking-wider"
                      required
                    />
                    {/* Đã ẩn danh sách mã ủy quyền, chỉ cho nhập thủ công */}
                  </div>
                  {/* Nút đăng ký */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="flex-1 py-3.5 rounded-xl bg-slate-600/80 hover:bg-slate-600 text-white font-semibold transition-all shadow-lg"
                    >
                      ĐĂNG NHẬP
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-bold shadow-lg transition-all"
                    >
                      ĐĂNG KÝ NGAY
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Tên đăng nhập"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-700/70 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-700/70 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setMode("register")}
                      className="flex-1 py-3.5 rounded-xl bg-slate-600/80 hover:bg-slate-600 text-white font-semibold transition-all shadow-lg"
                    >
                      TẠO TÀI KHOẢN
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-600 hover:to-emerald-500 text-white font-bold shadow-lg transition-all"
                    >
                      ĐĂNG NHẬP
                    </button>
                  </div>
                </form>
              )}

              {/* Footer */}
              <div className="w-full mt-8 pt-6 border-t border-slate-700/30">
                <div className="text-center space-y-2">
                  <p className="text-xs text-slate-500 font-medium">Thỏa thuận đăng ký người dùng</p>
                  <div className="space-y-1 pt-2">
                    <p className="text-sm font-bold text-slate-300">SCLM GLOBAL</p>
                    <p className="text-[10px] text-slate-400">Hệ thống chuỗi cung ứng toàn cầu</p>
                  </div>
                  <div className="border-t border-slate-700/30 my-3 mx-12"></div>
                  <div className="space-y-1 text-[9px] text-slate-500">
                    <p>SCM TM DV CO., LTD</p>
                    <p>Số đăng ký: 0110367441</p>
                    <p className="text-[8px]">Hotline: 0582-779-977 | Email: contact@sclm.vn</p>
                  </div>
                  <div className="text-[8px] text-slate-600 pt-2">
                    <p>© 2025 SCLM Global. All Rights Reserved.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
  {/* Bottom Navigation cố định trong khung */}
  <BottomNav active={activeTab} onChange={setActiveTab} />
      </div>
      </div>
    );
};

export default RegisterScreen;
