
import React, { useState, useEffect, useRef } from "react";
import { createDepositRequest, fetchUserDepositRequests, DepositRequestRow } from "../logic/depositRequests";
import { supabase } from "../supabaseClient";

export interface ProfileScreenProps {
  userId?: string; // Added for clarity
  accountName?: string; // Added for clarity
}


const DEFAULT_AVATAR = "/avatar-default.png";
const VIP_LOGOS: Record<string, string> = {
  VIP1: "/vip1.png",
  VIP2: "/vip2.png",
  VIP3: "/vip3.png",
  VIP4: "/vip4.png",
  VIP5: "/vip5.png",
  VIP6: "/vip6.png",
  VIP7: "/vip7.png",
  VIP8: "/vip8.png",
  VIP9: "/vip9.png",
};
const ProfileScreen: React.FC<ProfileScreenProps> = (props) => {
  const { userId = "", accountName = "" } = props;
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<DepositRequestRow[]>([]);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [avatar, setAvatar] = useState<string>(DEFAULT_AVATAR);
  const subRef = useRef<any>(null);
  // Security settings local state (placeholders for real logic)
  const [security, setSecurity] = useState({
    passkey: false,
    authApp: false,
    emailVerified: false,
    passwordSet: true,
    payPinSet: false,
    phoneVerified: false,
  });

  const toggleSecurity = (key: keyof typeof security) => {
    setSecurity(prev => ({ ...prev, [key]: !prev[key] }));
  };
  // Lấy thông tin user từ Supabase
  useEffect(() => {
    async function fetchUser() {
      if (!userId && !accountName) return;
      let query = supabase.from('users').select('*');
      if (userId) query = query.eq('id', userId);
      else if (accountName) query = query.eq('account_name', accountName);
      const { data, error } = await query.single();
      if (data) {
        setUserInfo(data);
        setAvatar(data.avatar_url || DEFAULT_AVATAR);
      }
    }
    fetchUser();
  }, [userId, accountName]);

  // Gửi yêu cầu nạp tiền
  const handleDeposit = async () => {
    if (!userId || userId.trim() === "") {
      alert("Không tìm thấy thông tin user!");
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 50) {
      alert("Số tiền nạp tối thiểu là 50");
      return;
    }
    setLoading(true);
    const { error } = await createDepositRequest({ userId, accountName, amount: amt });
    setLoading(false);
    if (error) {
      alert("Lỗi gửi yêu cầu nạp tiền!");
    } else {
      alert("Đã gửi yêu cầu nạp - trạng thái PENDING");
      setAmount("");
      fetchRequests();
    }
  };

  // Lấy danh sách yêu cầu nạp của user
  const fetchRequests = async () => {
    const { data } = await fetchUserDepositRequests(userId);
    setRequests(data || []);
  };

  // Realtime subscribe
  useEffect(() => {
    fetchRequests();
    // @ts-ignore
    const channel = window.supabase?.channel
      ? supabase.channel("deposit_requests")
      : null;
    if (channel) {
      subRef.current = channel
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "deposit_requests" },
          (payload: any) => {
            if (payload.new.user_id === userId) {
              if (payload.new.status === "approved") {
                alert("Yêu cầu nạp tiền đã được DUYỆT!");
              } else if (payload.new.status === "rejected") {
                alert("Yêu cầu nạp tiền bị TỪ CHỐI: " + (payload.new.reason || ""));
              }
              fetchRequests();
            }
          }
        )
        .subscribe();
    }
    return () => {
      if (subRef.current) subRef.current.unsubscribe();
    };
    // eslint-disable-next-line
  }, [userId]);

  // Đăng xuất
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Lỗi đăng xuất: " + error.message);
    } else {
      // Xóa cache localStorage/sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      // Chuyển về giao diện đăng nhập/đăng ký
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-8">
      <div className="w-full max-w-md mx-auto">
        {/* Card thông tin user */}
  <div className="relative bg-slate-800/90 backdrop-blur rounded-2xl shadow-2xl p-6 pt-14 mb-8 flex flex-col items-center border border-slate-700/50">
          {/* Ảnh đại diện */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2">
            <label htmlFor="avatar-upload">
              <img
                src={avatar}
                alt="Avatar"
                className="h-32 w-32 rounded-full border-4 border-slate-400 shadow-xl object-cover cursor-pointer bg-slate-200"
                title="Thay đổi ảnh đại diện"
              />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setAvatar(url);
                    // TODO: upload lên Supabase Storage và cập nhật user.avatar_url
                  }
                }}
              />
            </label>
            {/* Logo VIP động */}
            {userInfo?.vipLevel && (
              <img
                src={VIP_LOGOS[userInfo.vipLevel]}
                alt={userInfo.vipLevel}
                className="absolute -bottom-2 -right-2 h-12 w-12 rounded-full border-2 border-yellow-400 bg-white shadow-lg"
                title={`Cấp VIP: ${userInfo.vipLevel}`}
              />
            )}
          </div>
          <div className="mt-20 text-center">
            {/* Hiển thị ID ngẫu nhiên 8 ký tự bắt đầu bằng sclm nếu chưa có */}
            {(() => {
              // Ưu tiên hiển thị uid (5 số), nếu không có thì hiển thị ---
              let displayId = userInfo?.uid || userInfo?.id || accountName || '---';
              if (typeof displayId === 'number') displayId = String(displayId);
              if (!/^[0-9]{5}$/.test(displayId)) displayId = '---';
              return (
                <>
                  <p className="text-slate-400 text-sm mb-1">ID: <span className="font-mono tracking-wider">{displayId}</span></p>
                  <h2 className="text-2xl font-bold text-white drop-shadow mb-2">{userInfo?.username || accountName}</h2>
                </>
              );
            })()}
            <p className="text-slate-400 text-sm">Email: {userInfo?.email || 'Chưa cập nhật'}</p>
            <p className="text-slate-400 text-sm">Số điện thoại: {userInfo?.phone || 'Chưa cập nhật'}</p>
            {userInfo?.vipLevel && /^VIP[1-9]/.test(userInfo.vipLevel) && (
              <p className="text-slate-400 text-sm">VIP: <span className="font-semibold text-yellow-400">{userInfo.vipLevel}</span></p>
            )}
            <p className="text-slate-400 text-sm">Số dư: <span className="font-bold text-emerald-400">${userInfo?.balance?.toFixed(2) ?? '0.00'}</span></p>
            <p className="text-slate-400 text-sm">Ngày đăng ký: {userInfo?.created_at ? new Date(userInfo.created_at).toLocaleString() : '---'}</p>
            <p className="text-slate-400 text-sm">Trạng thái: <span className="font-semibold">{userInfo?.status || 'active'}</span></p>
          </div>
        </div>
        {/* Đăng xuất & nạp tiền */}
  <div className="bg-slate-800/80 rounded-xl p-6 shadow-xl mb-8 border border-slate-700/40">
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-600 to-pink-500 text-white py-2 rounded font-semibold mb-4 shadow"
          >
            Đăng xuất
          </button>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-slate-200">Số tiền cần nạp ($)</label>
            <input
              type="number"
              min={50}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full border border-slate-600 rounded px-3 py-2 bg-slate-900 text-white placeholder-slate-500"
              placeholder="Nhập số tiền tối thiểu 50"
              disabled={loading}
            />
          </div>
          <button
            onClick={handleDeposit}
            className="w-full bg-gradient-to-r from-blue-600 to-emerald-500 text-white py-2 rounded font-semibold shadow"
            disabled={loading}
          >
            {loading ? "Đang gửi..." : "Gửi yêu cầu nạp"}
          </button>
        </div>
        {/* Lịch sử yêu cầu nạp */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-2 text-slate-200">Lịch sử yêu cầu nạp</h2>
          <ul className="bg-slate-800/80 rounded-xl p-4 shadow divide-y divide-slate-700">
            {requests.map(r => (
              <li key={r.id} className="py-2 flex justify-between items-center text-slate-200">
                <span>Mã: {r.id} - ${r.amount}</span>
                <span className={`text-xs font-bold ${r.status === "pending" ? "text-yellow-400" : r.status === "approved" ? "text-emerald-400" : "text-red-400"}`}>{r.status.toUpperCase()}</span>
              </li>
            ))}
            {requests.length === 0 && <li className="text-slate-500 text-sm">Chưa có yêu cầu nào</li>}
          </ul>
        </div>
        {/* Security section */}
        <div className="bg-slate-800/80 rounded-xl p-6 shadow-xl mb-8 border border-slate-700/40">
          <h2 className="text-lg font-bold mb-4 text-slate-200">Bảo mật</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/60">
              <div>
                <div className="font-semibold text-slate-100">Passkey (Sinh trắc học)</div>
                <div className="text-xs text-slate-400">Sử dụng sinh trắc học để đăng nhập an toàn</div>
              </div>
              <button onClick={() => toggleSecurity('passkey')} className={`px-3 py-1 rounded ${security.passkey ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-200'}`}>
                {security.passkey ? 'Bật' : 'Tắt'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/60">
              <div>
                <div className="font-semibold text-slate-100">Ứng dụng xác thực</div>
                <div className="text-xs text-slate-400">Sử dụng Google Authenticator/Authenticator app</div>
              </div>
              <button onClick={() => toggleSecurity('authApp')} className={`px-3 py-1 rounded ${security.authApp ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-200'}`}>
                {security.authApp ? 'Bật' : 'Bật'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/60">
              <div>
                <div className="font-semibold text-slate-100">Email</div>
                <div className="text-xs text-slate-400">{userInfo?.email || 'Chưa xác thực'}</div>
              </div>
              <button onClick={() => toggleSecurity('emailVerified')} className={`px-3 py-1 rounded ${security.emailVerified ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-200'}`}>
                {security.emailVerified ? 'Đã xác thực' : 'Xác thực'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/60">
              <div>
                <div className="font-semibold text-slate-100">Mật khẩu</div>
                <div className="text-xs text-slate-400">Quản lý mật khẩu đăng nhập</div>
              </div>
              <button onClick={() => {
                const np = prompt('Nhập mật khẩu mới:');
                if (np && np.length >= 6) {
                  // TODO: gọi API đổi mật khẩu; hiện là giả lập
                  alert('Mật khẩu đã được cập nhật (giả lập)');
                  setSecurity(prev => ({ ...prev, passwordSet: true }));
                } else if (np) alert('Mật khẩu phải >=6 ký tự');
              }} className="px-3 py-1 rounded bg-slate-600 text-slate-200">Đổi mật khẩu</button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/60">
              <div>
                <div className="font-semibold text-slate-100">Mã Pay PIN</div>
                <div className="text-xs text-slate-400">Mã rút/nạp giao dịch</div>
              </div>
              <button onClick={() => {
                const pin = prompt('Nhập mã PIN 6 chữ số:');
                if (pin && /^\d{6}$/.test(pin)) {
                  alert('Pay PIN đã được thiết lập (giả lập)');
                  setSecurity(prev => ({ ...prev, payPinSet: true }));
                } else if (pin) alert('PIN không hợp lệ');
              }} className={`px-3 py-1 rounded ${security.payPinSet ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-200'}`}>{security.payPinSet ? 'Đã thiết lập' : 'Thiết lập'}</button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/60">
              <div>
                <div className="font-semibold text-slate-100">Số điện thoại</div>
                <div className="text-xs text-slate-400">{userInfo?.phone || 'Chưa cập nhật'}</div>
              </div>
              <button onClick={() => {
                const ph = prompt('Nhập số điện thoại:');
                if (ph) {
                  // TODO: call API to update phone
                  alert('SĐT đã được cập nhật (giả lập)');
                  setSecurity(prev => ({ ...prev, phoneVerified: true }));
                  setUserInfo((u:any) => ({ ...u, phone: ph }));
                }
              }} className={`px-3 py-1 rounded ${security.phoneVerified ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-200'}`}>{security.phoneVerified ? 'Đã xác thực' : 'Cập nhật'}</button>
            </div>

            <div className="pt-2 border-t border-slate-700/40" />
            <div className="text-sm text-slate-400">Khác</div>
            <div className="grid grid-cols-1 gap-2 mt-2">
              <button onClick={() => alert('Liên hệ khẩn cấp (giả lập)')} className="text-left p-3 rounded-lg bg-slate-700/60">Liên hệ khẩn cấp</button>
              <button onClick={() => alert('Mã chống lừa đảo (giả lập)')} className="text-left p-3 rounded-lg bg-slate-700/60">Mã chống lừa đảo</button>
              <button onClick={() => alert('Hoạt động tài khoản (giả lập)')} className="text-left p-3 rounded-lg bg-slate-700/60">Hoạt động của tài khoản</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
