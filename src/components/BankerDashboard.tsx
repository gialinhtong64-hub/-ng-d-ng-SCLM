// Stub: Trả về số liệu đơn hàng mặc định cho user
import React, { useState, useEffect } from "react";
import { getRandomProduct } from "../productDatabase";
import { 
  getTransactionRequests, 
  approveDepositRequest, 
  rejectTransactionRequest,
  getAllUsers,
  updateUserByBanker
} from "../supabaseApi";
import { LanguageProvider, useLanguage } from "../i18n/LanguageContext";
import LanguageSelector from "../i18n/LanguageSelector";

// ⚠️ ĐỒNG BỘ VỚI APP - Dùng chung localStorage keys
const USERS_KEY = "sclm_users_v1";
const DEPOSIT_REQUESTS_KEY = "sclm_deposit_requests";
const WITHDRAW_REQUESTS_KEY = "sclm_withdraw_requests";
const USER_ORDERS_KEY = "sclm_user_orders"; // Đơn hàng được phân phối cho user

// Types for Banker System
type TransactionRequest = {
  id: string;
  userId: string;
  username: string;
  amount: number;
  method: string;
  bankInfo?: string;
  walletAddress?: string;
  status: "pending" | "approved" | "rejected";
  requestTime: string;
  processedTime?: string;
  note?: string;
};

// 🔥 HẬU ĐÀI BANKER - NGUỒN DỮ LIỆU GỐC
// Banker quyết định: Số đơn, chiết khấu, sản phẩm, quota, VIP, số dư
// App KHÔNG có quyền thay đổi - CHỈ HIỂN THỊ

type User = {
  user_id: number;                // ID người dùng (chuẩn mới)
  id?: string;                    // Legacy ID (giữ để tương thích)
  username: string;               // Tên đăng nhập
  fullName: string;               // Họ tên đầy đủ
  name?: string;                  // Tên (legacy)
  email: string;                  // Email
  phone: string;                  // Số điện thoại
  password: string;               // Mật khẩu
  vipLevel: string;               // Cấp VIP - BANKER QUẢN LÝ
  
  // ⚠️ CÁC FIELD QUAN TRỌNG - BANKER QUYẾT ĐỊNH
  walletBalance: number;          // Số dư ví (thay thế balance)
  balance?: number;               // Legacy field
  orderQuotaMax: number;          // Số đơn tối đa - BANKER ĐẶT
  orderQuotaUsed: number;         // Số đơn đã dùng - BANKER TÍNH
  pendingOrders: number;          // Số đơn chưa giải quyết - BANKER TÍNH
  totalCommission: number;        // Tổng chiết khấu - BANKER TÍNH
  
  creditScore: number;            // Điểm tín dụng
  totalOrders?: number;           // Legacy total orders
  registerTime: string;           // Thời gian đăng ký (thay thế registrationDate)
  registrationDate?: string;      // Legacy field
  status: "active" | "inactive" | "suspended"; // Trạng thái - BANKER QUẢN LÝ
  authCode?: string;              // Mã ủy quyền
  withdrawalPassword?: string;    // Mật khẩu rút tiền
};

type Order = {
  orderId: string;                // ID đơn hàng (chuẩn hóa)
  id?: string;                    // Legacy ID
  user_id: number;                // User ID (number, chuẩn mới)
  userId?: string;                // Legacy userId
  username: string;               // Tên người dùng
  productName: string;            // Tên sản phẩm
  productImage?: string;          // Hình ảnh sản phẩm
  orderAmount: number;            // Giá trị đơn (thay thế orderValue)
  orderValue?: number;            // Legacy field
  commission: number;             // Hoa hồng - BANKER ĐẶT
  requiredBalance: number;        // Số dư yêu cầu - BANKER ĐẶT (quan trọng!)
  createdAt: string;              // Thời gian tạo (thay thế transactionTime)
  transactionTime?: string;       // Legacy field
  completionTime?: string;        // Thời gian hoàn thành
  status: "pending" | "completed" | "processing"; // Trạng thái
  vipLevel: string;               // VIP level khi đặt đơn
};

type Product = {
  id: string;
  name: string;
  price: number;
  commission: number;
  stock: number;
  imageUrl: string;
};

// Dummy implementation to prevent crash. Replace with real logic if needed.
function getUserOrderStats(userId: any) {
  return {
    totalOrders: 0,
    pendingOrders: 0,
    missingOrders: 0
  };
}

const BankerDashboard: React.FC = () => {
  // Language support
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<"users" | "orders" | "products" | "transactions">("users");
  
  // ĐỒNG BỘ USERS TỪ LOCALSTORAGE - Tự động load khi component mount
  const [users, setUsers] = useState<User[]>([]);
  const [depositRequests, setDepositRequests] = useState<TransactionRequest[]>([]);
  const [withdrawRequests, setWithdrawRequests] = useState<TransactionRequest[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]); // Store all user orders
  
  // User detail view
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetailTab, setUserDetailTab] = useState<"info" | "orders" | "cards" | "usdt" | "address" | "logs">("info");
  
  // User edit form
  const [showEditForm, setShowEditForm] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: "",
    agentId: "", // Đại lý
    subAgentId: "", // Đại lý cấp hai
    username: "", // Tên người dùng
    phone: "", // Số điện thoại
    balance: 0, // Số dư tài khoản
    creditScore: 10, // Điểm tín dụng
    frozenBalance: 0, // Số tiền đóng lạnh
    vipLevel: "VIP1", // Cấp độ thành viên
    transactionStatus: "活性", // Trạng thái giao dịch
    controlStatus: "active" as "active" | "inactive" | "suspended", // Trạng thái kiểm soát
    password: "", // Mật khẩu đăng nhập
    transactionPassword: "", // Mật khẩu giao dịch
    taskQuota: 0 // Số lượng nhiệm vụ cấp
  });

  // Order distribution modal
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [selectedUserForOrders, setSelectedUserForOrders] = useState<User | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  
  // 💉 TIÊM ĐƠN - Order Injection Modal (PER USER)
  const [showInjectModal, setShowInjectModal] = useState(false);
  const [selectedUserForInject, setSelectedUserForInject] = useState<User | null>(null);
  const [injectFormData, setInjectFormData] = useState({
    injectDate: new Date().toISOString().split('T')[0],  // Ngày tiêm
    injectMode: 0,                                        // Lệnh tiêm (0 = tiêm tiếp theo)
    requiredBalance: 0,                                   // Phạm vi tiêm (số dư yêu cầu)
    commissionRate: 5,                                    // Tỷ lệ hoa hồng (%)
    userId: ""                                            // BẮT BUỘC - User được tiêm
  });
  
  // Bulk order distribution - Phát đơn hàng loạt cho tất cả users
  const [showBulkDistributeModal, setShowBulkDistributeModal] = useState(false);
  const [bulkOrderQuantity, setBulkOrderQuantity] = useState(5);
  const [bulkMinPrice, setBulkMinPrice] = useState<number | null>(null); // null = auto (30% số dư)
  const [bulkMaxPrice, setBulkMaxPrice] = useState<number | null>(null); // null = auto (90% số dư)

  // VIP discount and commission rates theo cấp bậc
  const getVipRates = (vipLevel: string) => {
    const rates: { [key: string]: { discount: number; commission: number } } = {
      "VIP1": { discount: 0.08, commission: 0.015 },  // 8% discount, 1.5% commission
      "VIP2": { discount: 0.10, commission: 0.020 },  // 10% discount, 2% commission
      "VIP3": { discount: 0.12, commission: 0.025 },  // 12% discount, 2.5% commission
      "VIP4": { discount: 0.14, commission: 0.030 },  // 14% discount, 3% commission
      "VIP5": { discount: 0.16, commission: 0.035 },  // 16% discount, 3.5% commission
      "VIP6": { discount: 0.18, commission: 0.040 },  // 18% discount, 4% commission
      "VIP7": { discount: 0.20, commission: 0.045 },  // 20% discount, 4.5% commission
      "VIP8": { discount: 0.22, commission: 0.050 }   // 22% discount, 5% commission
    };
    return rates[vipLevel] || rates["VIP1"]; // Default to VIP1 if not found
  };

  // Order templates - Danh sách đơn hàng có sẵn để phân phối
  const orderTemplates = [
    { 
      id: "TPL001", 
      name: "Universal Silicone Keyboard Protector",
      productName: "10.0/14.0/15.6inch Waterproof Universal Silicone Keyboard Protector Clear"
    },
    {
      id: "TPL002",
      name: "Press Food Processor Multifunction",
      productName: "JinC Chopper Multifunction Press Food Processor Gourmet Cuisine Manual Food Blender Grinder"
    },
    {
      id: "TPL003",
      name: "Faber Castell CX Plus Ball Pen",
      productName: "Faber Castell CX Plus 0.5mm Ball Pen"
    },
    {
      id: "TPL004",
      name: "Rabbit mushroom storage bag",
      productName: "0.18mm toiletries zipper matte multifunctional plastic storage bag travel bag"
    },
    {
      id: "TPL005",
      name: "8 Colour Gel Pens Set",
      productName: "8 Colour Morandi-0.5mm Gel Pens Art Markers Writing Set"
    }
  ];

  // Load users từ localStorage khi component mount
  useEffect(() => {
    loadUsersFromStorage();
    loadTransactionRequests();
    loadUserOrders();
    loadOrdersFromStorage();
    
    // Set up interval để tự động refresh mỗi 2 giây
    const interval = setInterval(() => {
      loadUsersFromStorage();
      loadTransactionRequests();
      loadUserOrders();
      loadOrdersFromStorage();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Load all user orders from localStorage
  const loadUserOrders = () => {
    const ordersData = localStorage.getItem(USER_ORDERS_KEY);
    if (ordersData) {
      try {
        setAllOrders(JSON.parse(ordersData));
      } catch (e) {
        console.error("Error loading orders:", e);
      }
    }
  };

  // Calculate user order statistics
    
  
  const loadUsersFromStorage = async () => {
    try {
      console.log('🔄 Loading users from Supabase...');
      
      // Lấy users từ Supabase (đã có localStorage fallback bên trong)
      const supabaseUsers = await getAllUsers();
      
      if (supabaseUsers && supabaseUsers.length > 0) {
        // Convert to Banker User format
        const bankerUsers: User[] = supabaseUsers.map((u: any) => ({
          user_id: u.user_id,
          id: String(u.user_id), // Luôn dùng user_id làm id cho app
          username: u.username || "Unknown",
          fullName: u.fullName || u.name || u.username || "Unknown",
          name: u.name || u.fullName || u.username || "Unknown",
          email: u.email || "",
          phone: u.phone || "",
          password: u.password || "",
          vipLevel: u.vipLevel || "VIP1",
          walletBalance: u.walletBalance || u.balance || 0,
          balance: u.balance || u.walletBalance || 0,
          orderQuotaMax: u.orderQuotaMax || 0,
          orderQuotaUsed: u.orderQuotaUsed || 0,
          pendingOrders: u.pendingOrders || 0,
          totalCommission: u.totalCommission || 0,
          creditScore: u.creditScore || 10,
          totalOrders: u.totalOrders || 0,
          registerTime: u.registerTime || u.registrationDate || new Date().toISOString(),
          registrationDate: u.registrationDate || new Date().toISOString().split('T')[0],
          status: u.status || "active",
          authCode: u.authCode
        }));
        
        console.log(`✅ Loaded ${bankerUsers.length} users from Supabase`);
        setUsers(bankerUsers);
        return;
      }
      
      // Fallback: Load từ localStorage nếu Supabase trả về empty
      console.warn('⚠️ Supabase returned no users, loading from localStorage');
      const usersData = localStorage.getItem(USERS_KEY);
      if (usersData) {
        try {
          const parsedUsers = JSON.parse(usersData);
          const bankerUsers: User[] = parsedUsers.map((u: any, index: number) => ({
            user_id: u.user_id || Date.now() + index,
            id: u.id || String(u.user_id || Date.now() + index), // Nếu không có id thì lấy user_id
            username: u.username || "Unknown",
            fullName: u.name || u.username || "Unknown",
            name: u.name || u.username || "Unknown",
            email: u.email || "",
            phone: u.phone || "",
            password: u.password || "",
            vipLevel: u.vipLevel || "VIP1",
            walletBalance: u.walletBalance || u.balance || 0,
            balance: u.balance || u.walletBalance || 0,
            orderQuotaMax: u.orderQuotaMax || 0,
            orderQuotaUsed: u.orderQuotaUsed || 0,
            pendingOrders: u.pendingOrders || 0,
            totalCommission: u.totalCommission || 0,
            creditScore: u.creditScore || 10,
            totalOrders: u.totalOrders || 0,
            registerTime: u.registerTime || new Date().toISOString(),
            registrationDate: u.registrationDate || new Date().toISOString().split('T')[0],
            status: u.status || "active",
            authCode: u.authCode
          }));
          setUsers(bankerUsers);
          console.log(`✅ Loaded ${bankerUsers.length} users from localStorage (fallback)`);
        } catch (e) {
          console.error("Error parsing localStorage users:", e);
          setUsers([]);
        }
      } else {
        console.warn('⚠️ No users found in localStorage either');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  // Save users back to localStorage
  const saveUsersToStorage = (updatedUsers: User[]) => {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
    } catch (e) {
      console.error("Error saving users:", e);
      alert("❌ Lỗi khi lưu dữ liệu!");
    }
  };

  // 💉 TIÊM ĐƠN - Xử lý submit lệnh tiêm (PER USER)
  const handleInjectSubmit = () => {
    const { injectDate, injectMode, requiredBalance, commissionRate, userId } = injectFormData;
    
    // ⚠️ BẮT BUỘC PHẢI CÓ userId
    if (!userId) {
      alert("❌ Lỗi: Không có userId!\n\nLệnh tiêm phải gắn với 1 tài khoản cụ thể.");
      return;
    }
    
    // Validate
    if (requiredBalance < 0) {
      alert("❌ Phạm vi tiêm (requiredBalance) phải >= 0");
      return;
    }
    
    if (commissionRate < 0 || commissionRate > 100) {
      alert("❌ Tỷ lệ hoa hồng phải từ 0-100%");
      return;
    }
    
    // Tìm user để hiển thị tên
    const user = users.find(u => u.id === userId);
    if (!user) {
      alert("❌ Không tìm thấy user!");
      return;
    }
    
    // ⚠️ QUAN TRỌNG: Không kiểm tra số dư user - đây là TIÊM ĐƠN VƯỢT VỐN
    // Banker quyết định, app chỉ hiển thị warning
    
    // Tạo lệnh tiêm - GẮN VỚI USER CỤ THỂ
    const injectCommand = {
      injectId: `INJ-${Date.now()}`,
      userId: userId,                       // ⭐ BẮT BUỘC
      username: user.username,
      fullName: user.fullName,
      date: injectDate,
      mode: injectMode,
      requiredBalance: requiredBalance,
      rate: commissionRate,
      createdAt: new Date().toISOString(),
      status: "ACTIVE"                      // ACTIVE | STOPPED
    };
    
    // Lưu vào localStorage
    const existingCommands = JSON.parse(localStorage.getItem("sclm_inject_commands") || "[]");
    existingCommands.push(injectCommand);
    localStorage.setItem("sclm_inject_commands", JSON.stringify(existingCommands));
    
    alert(`✅ Đã tạo lệnh tiêm cho user!\n\n� User: ${user.fullName} (${user.username})\n�📅 Ngày tiêm: ${injectDate}\n💰 Phạm vi: ${requiredBalance.toLocaleString()} VNĐ\n📊 Hoa hồng: ${commissionRate}%\n🔄 Trạng thái: ACTIVE`);
    
    setShowInjectModal(false);
    setSelectedUserForInject(null);
    
    // Reset form
    setInjectFormData({
      injectDate: new Date().toISOString().split('T')[0],
      injectMode: 0,
      requiredBalance: 0,
      commissionRate: 5,
      userId: ""
    });
  };

  // Load transaction requests from localStorage
  const loadTransactionRequests = async () => {
    try {
      // Load deposit requests from Supabase
      const deposits = await getTransactionRequests('deposit');
      if (deposits && Array.isArray(deposits)) {
        // Convert Supabase transaction requests to Banker format
        const formattedDeposits = deposits.map((req: any) => ({
          id: String(req.id), // Convert number to string for UI
          userId: String(req.user_id),
          username: req.username,
          amount: req.amount,
          method: req.method || "Chuyển khoản",
          status: req.status,
          requestTime: req.created_at,
          processedTime: req.processed_at,
          note: req.note
        }));
        setDepositRequests(formattedDeposits.filter((d: TransactionRequest) => d.status === "pending"));
      }

      // Load withdraw requests from Supabase
      const withdraws = await getTransactionRequests('withdraw');
      if (withdraws && Array.isArray(withdraws)) {
        const formattedWithdraws = withdraws.map((req: any) => ({
          id: String(req.id),
          userId: String(req.uid),
          username: req.username,
          amount: req.amount,
          method: req.method || "Chuyển khoản",
          status: req.status,
          requestTime: req.created_at,
          processedTime: req.processed_at,
          note: req.note
        }));
        setWithdrawRequests(formattedWithdraws.filter((w: TransactionRequest) => w.status === "pending"));
      }
    } catch (e) {
      console.error("Error loading transaction requests from Supabase:", e);
    }
  };

  // Approve deposit request
  const approveDeposit = async (requestId: string) => {
    try {
      console.log('🔍 Đang xử lý deposit request via Supabase:', requestId);

      // Convert string ID to number for Supabase
      const numericId = parseInt(requestId);
      if (isNaN(numericId)) {
        alert("❌ ID không hợp lệ!");
        return;
      }

      // Call Supabase API to approve deposit (this updates user balance)
      const result = await approveDepositRequest(numericId);

      if (result.error) {
        console.error('❌ Error approving deposit:', result.error);
        alert("❌ Lỗi khi duyệt yêu cầu!");
        return;
      }

      console.log('✅ Đã duyệt nạp tiền qua Supabase:', result);

      // Reload transaction requests to update UI
      loadTransactionRequests();
      loadUsersFromStorage(); // ⭐ Reload users để cập nhật state
      
      alert(`✅ Đã duyệt nạp tiền thành công!\n\n💰 Số dư đã được cộng vào tài khoản user!`);
    } catch (e) {
      console.error("Error approving deposit:", e);
      alert("❌ Lỗi khi duyệt yêu cầu!");
    }
  };

  // Reject deposit request
  const rejectDeposit = async (requestId: string) => {
    const reason = prompt("Nhập lý do từ chối:");
    if (!reason) return;

    try {
      // Convert string ID to number for Supabase
      const numericId = parseInt(requestId);
      if (isNaN(numericId)) {
        alert("❌ ID không hợp lệ!");
        return;
      }

      // Call Supabase API to reject deposit
      const result = await rejectTransactionRequest(numericId, reason);

      if (result.error) {
        console.error('❌ Error rejecting deposit:', result.error);
        alert("❌ Lỗi khi từ chối yêu cầu!");
        return;
      }

      console.log('✅ Đã từ chối deposit qua Supabase');

      loadTransactionRequests();
      alert(`❌ Đã từ chối yêu cầu nạp tiền\n\nLý do: ${reason}`);
    } catch (e) {
      console.error("Error rejecting deposit:", e);
      alert("❌ Lỗi khi từ chối yêu cầu!");
    }
  };

  // Approve withdraw request
  const approveWithdraw = (requestId: string) => {
    const withdrawData = localStorage.getItem(WITHDRAW_REQUESTS_KEY);
    if (!withdrawData) return;

    try {
      const withdraws: TransactionRequest[] = JSON.parse(withdrawData);
      const request = withdraws.find(w => w.id === requestId);
      if (!request) return;

      // Update request status
      const updatedWithdraws = withdraws.map(w =>
        w.id === requestId
          ? { ...w, status: "approved" as const, processedTime: new Date().toISOString() }
          : w
      );
      localStorage.setItem(WITHDRAW_REQUESTS_KEY, JSON.stringify(updatedWithdraws));

      // Update user balance (already deducted when request was made)
      loadTransactionRequests();
      alert(`✅ Đã duyệt rút $${request.amount.toFixed(2)} cho user ${request.username}\n\n💸 Vui lòng chuyển tiền cho user!`);
    } catch (e) {
      console.error("Error approving withdraw:", e);
      alert("❌ Lỗi khi duyệt yêu cầu!");
    }
  };

  // Reject withdraw request
  const rejectWithdraw = (requestId: string) => {
    const reason = prompt("Nhập lý do từ chối:");
    if (!reason) return;

    const withdrawData = localStorage.getItem(WITHDRAW_REQUESTS_KEY);
    if (!withdrawData) return;

    try {
      const withdraws: TransactionRequest[] = JSON.parse(withdrawData);
      const request = withdraws.find(w => w.id === requestId);
      if (!request) return;

      // Update request status
      const updatedWithdraws = withdraws.map(w =>
        w.id === requestId
          ? { ...w, status: "rejected" as const, processedTime: new Date().toISOString(), note: reason }
          : w
      );
      localStorage.setItem(WITHDRAW_REQUESTS_KEY, JSON.stringify(updatedWithdraws));

      // Refund user balance - Đồng bộ cả 2 field
      const updatedUsers = users.map(u =>
        u.id === request.userId
          ? { 
              ...u, 
              balance: (u.balance || 0) + request.amount,           // Legacy field
              walletBalance: (u.walletBalance || 0) + request.amount // New field
            }
          : u
      );
      saveUsersToStorage(updatedUsers);

      loadTransactionRequests();
      alert(`❌ Đã từ chối yêu cầu rút tiền\n\nLý do: ${reason}\n\n💰 Số dư đã được hoàn lại!`);
    } catch (e) {
      console.error("Error rejecting withdraw:", e);
      alert("❌ Lỗi khi từ chối yêu cầu!");
    }
  };

  // Load orders từ localStorage
  const loadOrdersFromStorage = () => {
    const ordersData = localStorage.getItem(USER_ORDERS_KEY);
    if (ordersData) {
      try {
        const allOrders = JSON.parse(ordersData);
        // Convert to Banker Order format
        const bankerOrders: Order[] = allOrders.map((o: any) => ({
          id: o.id,
          userId: o.userId,
          username: o.username,
          productName: o.shortName || o.productName,
          orderValue: o.price || 0,
          commission: o.commission || 0,
          transactionTime: o.assignedTime ? new Date(o.assignedTime).toLocaleString('vi-VN') : '-',
          completionTime: o.completionTime ? new Date(o.completionTime).toLocaleString('vi-VN') : '',
          status: o.status || "pending",
          vipLevel: o.vipLevel || "VIP1"
        }));
        setOrders(bankerOrders);
      } catch (e) {
        console.error("Error loading orders:", e);
      }
    }
  };

  const [orders, setOrders] = useState<Order[]>([]);

  // BULK ORDER DISTRIBUTION - Phát đơn hàng loạt cho TẤT CẢ users
  const distributeBulkOrders = () => {
    if (bulkOrderQuantity <= 0) {
      alert("❌ Số lượng đơn không hợp lệ! Vui lòng nhập số lớn hơn 0.");
      return;
    }

    // ⚠️ LỌC CHỈ CÁC USER ĐANG HOẠT ĐỘNG (KHÔNG CẦN KIỂM TRA SỐ DƯ)
    const activeUsers = users.filter(u => u.status === "active");

    if (activeUsers.length === 0) {
      alert("❌ Không có user nào đang hoạt động!");
      return;
    }

    let totalOrdersCreated = 0;
    const allNewOrders: any[] = [];

    activeUsers.forEach(user => {
      const userBalance = user.balance || 0;
      const vipRates = getVipRates(user.vipLevel || "VIP1");
      
      // Tính khoảng giá: Nếu admin đặt thì dùng, không thì tự động theo % số dư
      // Nếu user có số dư = 0 → Dùng giá cố định 100-500
      const minPrice = bulkMinPrice !== null 
        ? bulkMinPrice 
        : (userBalance > 0 ? userBalance * 0.3 : 100);
      const maxPrice = bulkMaxPrice !== null 
        ? bulkMaxPrice 
        : (userBalance > 0 ? userBalance * 0.9 : 500);
      
      // Không giới hạn maxPrice theo số dư - Banker có quyền phát đơn vượt vốn
      const safeMaxPrice = maxPrice;
      
      if (minPrice >= safeMaxPrice || minPrice < 0) {
        return; // Skip user này nếu giá không hợp lệ
      }

      for (let i = 0; i < bulkOrderQuantity; i++) {
        // 🎲 LẤY SẢN PHẨM NGẪU NHIÊN TỪ DATABASE
        const randomProduct = getRandomProduct();
        
        const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 10000)}`;
        const randomPrice = Math.floor(Math.random() * (safeMaxPrice - minPrice) + minPrice * 100) / 100;
        const discount = Math.floor(randomPrice * vipRates.discount * 100) / 100;
        const commission = Math.floor(randomPrice * vipRates.commission * 100) / 100;
        
        const order = {
          id: orderId,
          userId: user.id,
          username: user.username,
          fullName: user.fullName || user.username,
          productName: randomProduct.name,          // 🎯 Tên sản phẩm từ database
          shortName: randomProduct.name.substring(0, 30) + (randomProduct.name.length > 30 ? '...' : ''),
          imageUrl: randomProduct.imageUrl,          // 🎯 Hình ảnh sản phẩm
          description: randomProduct.description,     // 🎯 Mô tả sản phẩm
          category: randomProduct.category,           // 🎯 Danh mục
          price: randomPrice,
          discount: discount,
          commission: commission,
          status: "pending",
          assignedTime: new Date().toISOString(),
          createdBy: "banker_bulk"
        };
        
        allNewOrders.push(order);
        totalOrdersCreated++;
      }
    });

    // Lưu tất cả đơn vào localStorage
    const existingOrders = JSON.parse(localStorage.getItem(USER_ORDERS_KEY) || "[]");
    const updatedOrders = [...existingOrders, ...allNewOrders];
    localStorage.setItem(USER_ORDERS_KEY, JSON.stringify(updatedOrders));

    alert(`✅ PHÁT ĐỢT ĐƠN HÀNG THÀNH CÔNG!\n\n👥 Số users nhận đơn: ${activeUsers.length}\n📦 Tổng số đơn đã tạo: ${totalOrdersCreated}\n💰 Mỗi user: ${bulkOrderQuantity} đơn\n🎯 Giá: ${bulkMinPrice !== null ? `$${bulkMinPrice.toFixed(2)}` : 'Auto 30%'} - ${bulkMaxPrice !== null ? `$${bulkMaxPrice.toFixed(2)}` : 'Auto 90% số dư'}\n\n⏳ Đơn hàng đã được đồng bộ vào app!`);
    
    setShowBulkDistributeModal(false);
    setBulkOrderQuantity(5);
    setBulkMinPrice(null);
    setBulkMaxPrice(null);
  };

  // Order Distribution Function - Phân phối đơn hàng cho user
  const distributeOrdersToUser = (user: User, quantity: number) => {
    if (quantity <= 0) {
      alert("❌ Số lượng đơn không hợp lệ! Vui lòng nhập số lớn hơn 0.");
      return;
    }

    // ⚠️ BANKER CÓ THỂ PHÁT ĐƠN BẤT KỂ SỐ DƯ USER LÀ BAO NHIÊU
    // Nếu user không đủ tiền → App sẽ hiển thị cảnh báo "Liên hệ CSKH nạp tiền"
    const userBalance = user.balance || 0;

    const userOrders = [];
    const now = new Date();
    
    // Lấy rates theo VIP level của user
    const vipRates = getVipRates(user.vipLevel || "VIP1");
    
    // Tính khoảng giá cho tất cả đơn
    // Nếu user có số dư > 0 → Dùng % số dư
    // Nếu user có số dư = 0 → Dùng giá cố định 100-500
    const minPrice = userBalance > 0 ? userBalance * 0.3 : 100;
    const maxPrice = userBalance > 0 ? userBalance * 0.9 : 500;
    
    for (let i = 0; i < quantity; i++) {
      // Chọn ngẫu nhiên template từ danh sách
      const template = orderTemplates[Math.floor(Math.random() * orderTemplates.length)];
      
      // Tạo order ID duy nhất
      const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 10000)}`;
      
      // Tạo giá ngẫu nhiên THẤP HƠN số dư hiện có của user
      const randomPrice = Math.floor(Math.random() * (maxPrice - minPrice) + minPrice * 100) / 100;
      
      // Tính discount và commission theo cấp bậc VIP
      const discount = Math.floor(randomPrice * vipRates.discount * 100) / 100;
      const commission = Math.floor(randomPrice * vipRates.commission * 100) / 100;
      
      const order = {
        id: orderId,
        userId: user.id,
        username: user.username,
        fullName: user.fullName || user.username,
        productName: template.productName,
        shortName: template.name,
        price: randomPrice, // Giá ngẫu nhiên thấp hơn số dư
        discount: discount,
        commission: commission,
        status: "pending", // Chờ xử lý
        assignedTime: now.toISOString(),
        createdBy: "banker"
      };
      
      userOrders.push(order);
    }

    // Lưu vào localStorage
    const existingOrders = JSON.parse(localStorage.getItem(USER_ORDERS_KEY) || "[]");
    const updatedOrders = [...existingOrders, ...userOrders];
    localStorage.setItem(USER_ORDERS_KEY, JSON.stringify(updatedOrders));

    alert(`✅ Đã phân phối ${quantity} đơn hàng cho ${user.fullName || user.username}!\n\n📦 Số dư user: $${userBalance.toFixed(2)}\n💰 Giá đơn: Ngẫu nhiên từ $${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}\n⏳ Đơn hàng đã được đồng bộ vào app.`);
    
    setShowDistributeModal(false);
    setOrderQuantity(1);
  };

  // User Management Functions - CẬP NHẬT VÀ LƯU VÀO LOCALSTORAGE
  const adjustBalance = (userId: string, amount: number, type: "add" | "subtract") => {
    const updatedUsers = users.map(u => 
      u.id === userId 
        ? { 
            ...u, 
            balance: type === "add" ? (u.balance || 0) + amount : (u.balance || 0) - amount,
            walletBalance: type === "add" ? (u.walletBalance || 0) + amount : (u.walletBalance || 0) - amount
          }
        : u
    );
    saveUsersToStorage(updatedUsers);
    alert(`✅ ${type === "add" ? "Đã cộng" : "Đã trừ"} $${amount.toFixed(2)} ${type === "add" ? "vào" : "từ"} tài khoản ${userId}\n\n💾 Đã lưu vào hệ thống!`);
  };

  const changeVipLevel = (userId: string, newLevel: string) => {
    const updatedUsers = users.map(u => 
      u.id === userId 
        ? { 
            ...u, 
            vipLevel: newLevel,
            totalCommission: 0  // 🔥 RESET lợi nhuận khi lên VIP
          } 
        : u
    );
    saveUsersToStorage(updatedUsers);
    alert(`✅ Đã thay đổi cấp VIP của user ${userId} thành ${newLevel}\n\n🔄 Lợi nhuận đã được reset về 0\n💾 Đã lưu vào hệ thống!`);
  };

  const changeUserStatus = (userId: string, newStatus: "active" | "inactive" | "suspended") => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, status: newStatus } : u
    );
    saveUsersToStorage(updatedUsers);
    const statusText = newStatus === "active" ? "Kích hoạt" : newStatus === "inactive" ? "Vô hiệu hóa" : "Đình chỉ";
    alert(`✅ Đã ${statusText} tài khoản ${userId}\n\n💾 Đã lưu vào hệ thống!`);
  };

  const updateUserInfo = (userId: string, field: keyof User, value: any) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, [field]: value } : u
    );
    saveUsersToStorage(updatedUsers);
    alert(`✅ Đã cập nhật thông tin user ${userId}\n\n💾 Đã lưu vào hệ thống!`);
  };

  // Order Processing - BANKER CÓ THỂ XỬ LÝ ĐƠN BẤT KỲ LÚC NÀO
  const completeOrder = (orderId: string) => {
    const ordersData = localStorage.getItem(USER_ORDERS_KEY);
    if (!ordersData) return;

    try {
      const allOrders = JSON.parse(ordersData);
      const order = allOrders.find((o: any) => o.id === orderId);
      
      if (!order) {
        alert("❌ Không tìm thấy đơn hàng!");
        return;
      }

      if (order.status === "completed") {
        alert("⚠️ Đơn hàng này đã được hoàn thành rồi!");
        return;
      }

      // BANKER KHÔNG CẦN KIỂM TRA SỐ DƯ - CÓ THỂ XỬ LÝ ĐƠN BẤT CỨ LÚC NÀO
      const updatedOrders = allOrders.map((o: any) =>
        o.id === orderId
          ? { 
              ...o, 
              status: "completed",
              completionTime: new Date().toISOString(),
              completedBy: "banker"
            }
          : o
      );
      
      localStorage.setItem(USER_ORDERS_KEY, JSON.stringify(updatedOrders));

      // Cộng hoa hồng vào tài khoản user
      const user = users.find(u => u.id === order.userId);
      if (user) {
        const updatedUsers = users.map(u => 
          u.id === order.userId 
            ? { 
                ...u, 
                balance: u.balance + order.commission,
                totalOrders: (u.totalOrders || 0) + 1
              }
            : u
        );
        saveUsersToStorage(updatedUsers);
      }

      alert(`✅ ĐƠN HÀNG ${orderId} ĐÃ HOÀN THÀNH!\n\n👤 User: ${order.username}\n💰 Giá trị đơn: $${order.price?.toFixed(2) || '0.00'}\n🎁 Hoa hồng: +$${order.commission?.toFixed(2) || '0.00'}\n\n💾 Đã cập nhật số dư user!`);
      
      // Reload orders
      loadUserOrders();
    } catch (e) {
      console.error("Error completing order:", e);
      alert("❌ Lỗi khi xử lý đơn hàng!");
    }
  };

  const deleteUser = (userId: string) => {
    if (!window.confirm(`⚠️ XÓA TÀI KHOẢN ${userId}?\n\nHành động này không thể hoàn tác!`)) {
      return;
    }
    const updatedUsers = users.filter(u => u.id !== userId);
    saveUsersToStorage(updatedUsers);
    alert(`✅ Đã xóa tài khoản ${userId}\n\n💾 Đã lưu vào hệ thống!`);
  };

  const assignOrder = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    // Tạo đơn hàng mới
    const newOrder: Order = {
      orderId: `UB${Date.now()}`,
      id: `UB${Date.now()}`,
  user_id: user.user_id,
      userId: user.id,
      username: user.username,
      productName: "Apple Pencil Pro",
      productImage: "/san-pham0.jpg",
      orderAmount: 3435.00,
      orderValue: 3435.00,
      commission: 150.00,
      requiredBalance: 3435.00,
      createdAt: new Date().toISOString(),
      transactionTime: new Date().toLocaleString("sv-SE"),
      completionTime: "",
      status: "pending",
      vipLevel: user.vipLevel
    };
    
    setOrders(prev => [newOrder, ...prev]);
    alert(`✅ Đã phân phát đơn hàng ${newOrder.id} cho user ${user.username}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{t.banker.dashboard}</h1>
            <p className="text-sm text-slate-400 mt-1">{t.banker.controlPanel}</p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <div className="text-right">
              <p className="text-xs text-slate-400">{t.common.time}</p>
              <p className="text-sm font-semibold text-emerald-400">{new Date().toLocaleString("vi-VN")}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab("transactions")}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  depositRequests.length > 0 
                    ? "bg-red-600 hover:bg-red-700 animate-pulse" 
                    : "bg-slate-700 hover:bg-slate-600"
                }`}
              >
                🔔 nạp tiền <span className={`rounded-full px-1.5 py-0.5 text-[10px] ml-1 ${
                  depositRequests.length > 0 ? "bg-red-500 text-white" : "bg-slate-600 text-slate-300"
                }`}>{depositRequests.length}</span>
              </button>
              <button 
                onClick={() => setActiveTab("transactions")}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  withdrawRequests.length > 0 
                    ? "bg-red-600 hover:bg-red-700 animate-pulse" 
                    : "bg-slate-700 hover:bg-slate-600"
                }`}
              >
                🔔 Rút tiền <span className={`rounded-full px-1.5 py-0.5 text-[10px] ml-1 ${
                  withdrawRequests.length > 0 ? "bg-red-500 text-white" : "bg-slate-600 text-slate-300"
                }`}>{withdrawRequests.length}</span>
              </button>
            </div>
            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition-colors">
              👤 Admin
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-slate-900 border-b border-slate-700 px-6">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 text-sm font-semibold transition-colors ${
              activeTab === "users"
                ? "bg-emerald-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            👥 Quản lý thành viên
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-3 text-sm font-semibold transition-colors ${
              activeTab === "orders"
                ? "bg-emerald-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            📦 Kiểm soát giao dịch
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-6 py-3 text-sm font-semibold transition-colors ${
              activeTab === "products"
                ? "bg-emerald-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            🛍️ Quản lý sản phẩm
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`px-6 py-3 text-sm font-semibold transition-colors ${
              activeTab === "transactions"
                ? "bg-emerald-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            💰 Quản lý nạp/rút
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        {/* USERS TAB */}
        {activeTab === "users" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Danh sách thành viên</h2>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowBulkDistributeModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <span>📦</span>
                  <span>Phát đơn hàng loạt</span>
                </button>
                <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-semibold transition-colors">
                  + Thêm thành viên
                </button>
              </div>
            </div>

            {/* Search Filters */}
            <div className="bg-slate-900 rounded-xl p-4 mb-6 border border-slate-800">
              <div className="grid grid-cols-6 gap-3">
                <input type="text" placeholder="Mã điện thoại" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
                <input type="text" placeholder="Mã mời" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
                <input type="text" placeholder="Tên người dùng" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
                <select className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500">
                  <option>Tất cả các cấp VIP</option>
                  <option>VIP1</option>
                  <option>VIP2</option>
                  <option>VIP8</option>
                </select>
                <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition-colors">
                  Tìm kiếm
                </button>
                <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm font-semibold transition-colors">
                  Xuất khẩu
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Mã định danh</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Tài khoản</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Tên người dùng</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Email/SĐT</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Cấp VIP</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Số dư</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Số lượng đơn</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Đơn cần xử lý</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Số còn thiếu</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Vận hành</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="px-4 py-8 text-center text-slate-500">
                          Chưa có tài khoản nào được tạo từ App
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => {
                        const stats = getUserOrderStats(user.id);
                        return (
                          <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-3 text-sm text-slate-300">{user.id}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{user.username}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{user.fullName}</td>
                          <td className="px-4 py-3 text-xs text-slate-400">
                            <div>{user.email || "-"}</div>
                            <div>{user.phone || "-"}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-purple-600 text-white text-xs font-semibold rounded">
                              {user.vipLevel}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-emerald-400">${user.balance.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-slate-300 text-center">
                            <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs font-semibold rounded">
                              {stats.totalOrders}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-300 text-center">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              stats.pendingCount > 0 ? "bg-orange-600/20 text-orange-400" : "bg-slate-700/50 text-slate-400"
                            }`}>
                              {stats.pendingCount}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-center">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              stats.shortfall > 0 ? "bg-red-600/20 text-red-400" : "bg-emerald-600/20 text-emerald-400"
                            }`}>
                              ${stats.shortfall.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              user.status === "active" ? "bg-emerald-600 text-white" :
                              user.status === "suspended" ? "bg-red-600 text-white" :
                              "bg-slate-600 text-white"
                            }`}>
                              {user.status === "active" ? "Hoạt động" : 
                               user.status === "suspended" ? "Đình chỉ" : "Vô hiệu"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 flex-wrap items-center">
                              {/* Phím tắt nhanh - Quick Actions */}
                              <div className="flex gap-1 mr-1 p-1 bg-slate-800/50 rounded border border-slate-700/50">
                                <button 
                                  onClick={() => adjustBalance(user.id, 1000, "add")}
                                  className="px-2 py-1 bg-emerald-600/80 hover:bg-emerald-600 text-white text-[9px] font-bold rounded transition-colors"
                                  title="Nạp $1000 nhanh"
                                >
                                  +$1K
                                </button>
                                <button 
                                  onClick={() => adjustBalance(user.id, 5000, "add")}
                                  className="px-2 py-1 bg-emerald-600/80 hover:bg-emerald-600 text-white text-[9px] font-bold rounded transition-colors"
                                  title="Nạp $5000 nhanh"
                                >
                                  +$5K
                                </button>
                                <button 
                                  onClick={() => changeVipLevel(user.id, `VIP${Math.min(8, parseInt(user.vipLevel.replace('VIP', '')) + 1)}`)}
                                  className="px-2 py-1 bg-purple-600/80 hover:bg-purple-600 text-white text-[9px] font-bold rounded transition-colors"
                                  title="Nâng VIP lên 1 cấp"
                                >
                                  ⬆️VIP
                                </button>
                              </div>
                              
                              <button 
                                onClick={() => setSelectedUser(user)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold rounded transition-colors"
                                title="Xem chi tiết"
                              >
                                📋
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedUserForOrders(user);
                                  setShowDistributeModal(true);
                                }}
                                className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-[10px] font-semibold rounded transition-colors"
                                title="Phân phối đơn hàng"
                              >
                                📦
                              </button>
                              <button 
                                onClick={() => {
                                  // Mở popup tiêm cho user này
                                  setSelectedUserForInject(user);
                                  setInjectFormData({
                                    injectDate: new Date().toISOString().split('T')[0],
                                    injectMode: 0,
                                    requiredBalance: 0,
                                    commissionRate: 5,
                                    userId: user.id || ""
                                  });
                                  setShowInjectModal(true);
                                }}
                                className="px-2 py-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white text-[10px] font-semibold rounded transition-colors"
                                title="Tiêm đơn cho user này"
                              >
                                💉
                              </button>
                              <button 
                                onClick={() => {
                                  const action = prompt("Cộng (+) hoặc Trừ (-)?\n\nNhập: +100 hoặc -50");
                                  if (!action) return;
                                  const amount = parseFloat(action.replace(/[+\-]/g, ""));
                                  const type = action.startsWith("-") ? "subtract" : "add";
                                  if (!isNaN(amount)) adjustBalance(user.id, amount, type);
                                }}
                                className="px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-semibold rounded transition-colors"
                                title="Cộng/Trừ tiền"
                              >
                                💰
                              </button>
                              <button 
                                onClick={() => {
                                  const level = prompt("Nhập cấp VIP mới:\n\nVIP1, VIP2, VIP3, VIP4, VIP5, VIP6, VIP7, VIP8");
                                  if (level) changeVipLevel(user.id, level.toUpperCase());
                                }}
                                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-semibold rounded transition-colors"
                                title="Đổi VIP"
                              >
                                👑
                              </button>
                              <button 
                                onClick={() => {
                                  setEditFormData({
                                    id: user.id,
                                    agentId: user.username,
                                    subAgentId: "10033",
                                    username: user.fullName || user.username,
                                    phone: user.phone || "",
                                    balance: user.balance,
                                    creditScore: user.creditScore,
                                    frozenBalance: 0,
                                    vipLevel: user.vipLevel,
                                    transactionStatus: "活性",
                                    controlStatus: user.status,
                                    password: user.password,
                                    transactionPassword: "",
                                    taskQuota: 0
                                  });
                                  setShowEditForm(true);
                                }}
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold rounded transition-colors"
                                title="Biên tập thông tin đầy đủ"
                              >
                                ✏️
                              </button>
                              <button 
                                onClick={() => {
                                  const status = prompt("Chọn trạng thái:\n\nactive = Hoạt động\ninactive = Vô hiệu\nsuspended = Đình chỉ");
                                  if (status && ["active", "inactive", "suspended"].includes(status)) {
                                    changeUserStatus(user.id, status as any);
                                  }
                                }}
                                className="px-2 py-1 bg-slate-600 hover:bg-slate-700 text-white text-[10px] font-semibold rounded transition-colors"
                                title="Thay đổi trạng thái"
                              >
                                🔄
                              </button>
                              <button 
                                onClick={() => deleteUser(user.id)}
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-semibold rounded transition-colors"
                                title="Xóa tài khoản"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Danh sách đơn hàng</h2>
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-semibold transition-colors">
                + Tạo đơn hàng mới
              </button>
            </div>

            {/* Search Filters */}
            <div className="bg-slate-900 rounded-xl p-4 mb-6 border border-slate-800">
              <div className="grid grid-cols-5 gap-3">
                <input type="text" placeholder="Số đơn hàng" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
                <input type="text" placeholder="Tên người dùng" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
                <input type="text" placeholder="Số điện thoại" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500" />
                <select className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500">
                  <option>Tất cả trạng thái</option>
                  <option>Đang xử lý</option>
                  <option>Hoàn thành</option>
                  <option>Chờ xử lý</option>
                </select>
                <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition-colors">
                  Tìm kiếm
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Số đơn hàng</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Tên người dùng</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Sản phẩm</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Giá trị</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Hoa hồng</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Thời gian giao dịch</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 text-xs text-slate-300 font-mono">{order.id}</td>
                        <td className="px-4 py-3 text-sm text-slate-300">{order.username}</td>
                        <td className="px-4 py-3 text-sm text-slate-300">{order.productName}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-emerald-400">${order.orderValue.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-amber-400">${order.commission.toFixed(2)}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">
                          <div>{order.transactionTime}</div>
                          {order.completionTime && <div className="text-emerald-400">{order.completionTime}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            order.status === "completed" ? "bg-emerald-600 text-white" :
                            order.status === "processing" ? "bg-blue-600 text-white" :
                            "bg-orange-600 text-white"
                          }`}>
                            {order.status === "completed" ? "Hoàn thành" : 
                             order.status === "processing" ? "Đang xử lý" : "Chờ xử lý"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {order.status === "completed" ? (
                            <span className="px-3 py-1 bg-slate-700 text-slate-400 text-xs font-semibold rounded">
                              Đã xử lý
                            </span>
                          ) : (
                            <button 
                              onClick={() => completeOrder(order.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded transition-colors"
                              title="Xử lý đơn hàng và cộng hoa hồng cho user"
                            >
                              ✅ Hoàn thành
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === "products" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Quản lý sản phẩm</h2>
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-semibold transition-colors">
                + Thêm sản phẩm mới
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {[
                { id: "1", name: "Apple Pencil Pro", price: 3435.00, commission: 150.00, stock: 12, imageUrl: "/san-pham0.jpg" },
                { id: "2", name: "AirTag", price: 785.00, commission: 35.00, stock: 25, imageUrl: "/san-pham1.jpg" },
                { id: "3", name: "iPad mini", price: 14999.00, commission: 500.00, stock: 15, imageUrl: "/sam-pham5.jpg" }
              ].map((product) => (
                <div key={product.id} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-emerald-600 transition-colors">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="text-base font-bold text-slate-100 mb-2">{product.name}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Giá:</span>
                        <span className="font-semibold text-emerald-400">${product.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Hoa hồng:</span>
                        <span className="font-semibold text-amber-400">${product.commission.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Tồn kho:</span>
                        <span className="font-semibold text-slate-300">{product.stock}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded transition-colors">
                        Chỉnh sửa
                      </button>
                      <button className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition-colors">
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {activeTab === "transactions" && (
          <div>
            <h2 className="text-xl font-bold mb-6">Quản lý nạp tiền & rút tiền</h2>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Deposit Requests */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
                  <h3 className="text-lg font-bold text-emerald-400">
                    📥 Yêu cầu nạp tiền ({depositRequests.length})
                  </h3>
                </div>
                <div className="p-6 max-h-[600px] overflow-y-auto">
                  {depositRequests.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">
                      Không có yêu cầu nạp tiền chờ duyệt
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {depositRequests.map((request) => (
                        <div key={request.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-200">{request.username}</p>
                              <p className="text-xs text-slate-500">{request.userId}</p>
                            </div>
                            <p className="text-lg font-bold text-emerald-400">${request.amount.toFixed(2)}</p>
                          </div>
                          <div className="space-y-1 mb-3">
                            <p className="text-xs text-slate-400">
                              <span className="font-semibold">Phương thức:</span> {request.method}
                            </p>
                            {request.bankInfo && (
                              <p className="text-xs text-slate-400">
                                <span className="font-semibold">Thông tin:</span> {request.bankInfo}
                              </p>
                            )}
                            {request.walletAddress && (
                              <p className="text-xs text-slate-400">
                                <span className="font-semibold">Ví:</span> {request.walletAddress}
                              </p>
                            )}
                            <p className="text-xs text-slate-500">
                              <span className="font-semibold">Thời gian:</span> {new Date(request.requestTime).toLocaleString("vi-VN")}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => approveDeposit(request.id)}
                              className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded transition-colors"
                            >
                              ✅ Duyệt
                            </button>
                            <button
                              onClick={() => rejectDeposit(request.id)}
                              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded transition-colors"
                            >
                              ❌ Từ chối
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Withdrawal Requests */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
                  <h3 className="text-lg font-bold text-red-400">
                    📤 Yêu cầu rút tiền ({withdrawRequests.length})
                  </h3>
                </div>
                <div className="p-6 max-h-[600px] overflow-y-auto">
                  {withdrawRequests.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">
                      Không có yêu cầu rút tiền chờ duyệt
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {withdrawRequests.map((request) => (
                        <div key={request.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-200">{request.username}</p>
                              <p className="text-xs text-slate-500">{request.userId}</p>
                            </div>
                            <p className="text-lg font-bold text-red-400">${request.amount.toFixed(2)}</p>
                          </div>
                          <div className="space-y-1 mb-3">
                            <p className="text-xs text-slate-400">
                              <span className="font-semibold">Phương thức:</span> {request.method}
                            </p>
                            {request.bankInfo && (
                              <p className="text-xs text-slate-400">
                                <span className="font-semibold">Thông tin:</span> {request.bankInfo}
                              </p>
                            )}
                            {request.walletAddress && (
                              <p className="text-xs text-slate-400">
                                <span className="font-semibold">Ví:</span> {request.walletAddress}
                              </p>
                            )}
                            <p className="text-xs text-slate-500">
                              <span className="font-semibold">Thời gian:</span> {new Date(request.requestTime).toLocaleString("vi-VN")}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => approveWithdraw(request.id)}
                              className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded transition-colors"
                            >
                              ✅ Duyệt
                            </button>
                            <button
                              onClick={() => rejectWithdraw(request.id)}
                              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded transition-colors"
                            >
                              ❌ Từ chối
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* USER DETAIL MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-slate-800 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Thông tin chi tiết tài khoản</h2>
                <p className="text-sm text-slate-400 mt-1">{selectedUser.username} - {selectedUser.vipLevel}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded transition-colors"
              >
                ✕ Đóng
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="bg-slate-850 border-b border-slate-700 px-6 overflow-x-auto">
              <div className="flex gap-1 justify-between items-center">
                <div className="flex gap-1">
                  <button
                    onClick={() => setUserDetailTab("info")}
                    className={`px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${
                      userDetailTab === "info" ? "bg-orange-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    📋 Thông tin
                  </button>
                  <button
                    onClick={() => setUserDetailTab("orders")}
                    className={`px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${
                      userDetailTab === "orders" ? "bg-orange-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    📦 Đơn hàng
                  </button>
                  <button
                    onClick={() => setUserDetailTab("cards")}
                    className={`px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${
                      userDetailTab === "cards" ? "bg-orange-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    💳 Thẻ ngân hàng
                  </button>
                  <button
                    onClick={() => setUserDetailTab("usdt")}
                    className={`px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${
                      userDetailTab === "usdt" ? "bg-orange-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    ₮ USDT
                  </button>
                  <button
                    onClick={() => setUserDetailTab("address")}
                    className={`px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${
                      userDetailTab === "address" ? "bg-orange-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    📍 Địa chỉ
                  </button>
                  <button
                    onClick={() => setUserDetailTab("logs")}
                    className={`px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${
                      userDetailTab === "logs" ? "bg-orange-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    📊 Lịch sử
                  </button>
                </div>
                <button
                  onClick={() => {
                    setEditFormData({
                      id: selectedUser.id,
                      agentId: selectedUser.username, // Dùng username làm agent ID
                      subAgentId: "10033", // Demo
                      username: selectedUser.fullName || selectedUser.username,
                      phone: selectedUser.phone || "",
                      balance: selectedUser.balance,
                      creditScore: selectedUser.creditScore,
                      frozenBalance: 0,
                      vipLevel: selectedUser.vipLevel,
                      transactionStatus: "活性",
                      controlStatus: selectedUser.status,
                      password: selectedUser.password,
                      transactionPassword: "",
                      taskQuota: 0
                    });
                    setShowEditForm(true);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded transition-colors whitespace-nowrap"
                >
                  ✏️ Biên tập
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* THÔNG TIN TAB */}
              {userDetailTab === "info" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Cột trái */}
                    <div className="space-y-4">
                      <div className="bg-slate-800 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-slate-400 mb-3">Thông tin cơ bản</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">Mã định danh:</span>
                            <span className="text-sm font-semibold text-slate-200">{selectedUser.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">Tài khoản:</span>
                            <span className="text-sm font-semibold text-slate-200">{selectedUser.username}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">Tên đầy đủ:</span>
                            <span className="text-sm font-semibold text-slate-200">{selectedUser.fullName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">Email:</span>
                            <span className="text-sm font-semibold text-slate-200">{selectedUser.email || "Chưa cập nhật"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">Số điện thoại:</span>
                            <span className="text-sm font-semibold text-slate-200">{selectedUser.phone || "Chưa cập nhật"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">Ngày đăng ký:</span>
                            <span className="text-sm font-semibold text-slate-200">{selectedUser.registrationDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">Mã ủy quyền:</span>
                            <span className="text-sm font-semibold text-slate-200">{selectedUser.authCode || "N/A"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-800 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-slate-400 mb-3">Trạng thái tài khoản</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500">Trạng thái:</span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              selectedUser.status === "active" ? "bg-emerald-600 text-white" :
                              selectedUser.status === "suspended" ? "bg-red-600 text-white" :
                              "bg-slate-600 text-white"
                            }`}>
                              {selectedUser.status === "active" ? "Hoạt động" : 
                               selectedUser.status === "suspended" ? "Đình chỉ" : "Vô hiệu"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500">Cấp VIP:</span>
                            <span className="px-2 py-1 bg-purple-600 text-white text-xs font-semibold rounded">
                              {selectedUser.vipLevel}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">Điểm tín dụng:</span>
                            <span className="text-sm font-semibold text-yellow-400">{selectedUser.creditScore}/10</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cột phải */}
                    <div className="space-y-4">
                      <div className="bg-slate-800 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-slate-400 mb-3">Thông tin tài chính</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">Số dư hiện tại:</span>
                            <span className="text-lg font-bold text-emerald-400">${selectedUser.balance.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">Tổng đơn hàng:</span>
                            <span className="text-sm font-semibold text-slate-200">{selectedUser.totalOrders}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">Tổng nạp tiền:</span>
                            <span className="text-sm font-semibold text-blue-400">$0.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">Tổng rút tiền:</span>
                            <span className="text-sm font-semibold text-red-400">$0.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">Hoa hồng nhận:</span>
                            <span className="text-sm font-semibold text-amber-400">$0.00</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-800 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-slate-400 mb-3">Thao tác nhanh</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              const action = prompt("Cộng (+) hoặc Trừ (-)?\n\nNhập: +100 hoặc -50");
                              if (!action) return;
                              const amount = parseFloat(action.replace(/[+\-]/g, ""));
                              const type = action.startsWith("-") ? "subtract" : "add";
                              if (!isNaN(amount)) {
                                adjustBalance(selectedUser.id, amount, type);
                                setSelectedUser({ ...selectedUser, balance: type === "add" ? selectedUser.balance + amount : selectedUser.balance - amount });
                              }
                            }}
                            className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded transition-colors"
                          >
                            💰 Cộng/Trừ tiền
                          </button>
                          <button
                            onClick={() => {
                              const level = prompt("Nhập cấp VIP mới:\n\nVIP1, VIP2, VIP3, VIP4, VIP5, VIP6, VIP7, VIP8");
                              if (level) {
                                changeVipLevel(selectedUser.id, level.toUpperCase());
                                setSelectedUser({ ...selectedUser, vipLevel: level.toUpperCase() });
                              }
                            }}
                            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded transition-colors"
                          >
                            👑 Đổi VIP
                          </button>
                          <button
                            onClick={() => {
                              const status = prompt("Chọn trạng thái:\n\nactive = Hoạt động\ninactive = Vô hiệu\nsuspended = Đình chỉ");
                              if (status && ["active", "inactive", "suspended"].includes(status)) {
                                changeUserStatus(selectedUser.id, status as any);
                                setSelectedUser({ ...selectedUser, status: status as any });
                              }
                            }}
                            className="px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white text-xs font-semibold rounded transition-colors"
                          >
                            🔒 Đổi trạng thái
                          </button>
                          <button
                            onClick={() => assignOrder(selectedUser.id)}
                            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded transition-colors"
                          >
                            📦 Phát đơn
                          </button>
                          <button
                            onClick={() => {
                              deleteUser(selectedUser.id);
                              setSelectedUser(null);
                            }}
                            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition-colors col-span-2"
                          >
                            🗑️ Xóa tài khoản
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ĐƠN HÀNG TAB */}
              {userDetailTab === "orders" && (
                <div>
                  <h3 className="text-lg font-bold text-slate-200 mb-4">Lịch sử đơn hàng</h3>
                  <div className="bg-slate-800 rounded-lg p-4">
                    <p className="text-sm text-slate-500 text-center py-8">Chưa có đơn hàng nào</p>
                  </div>
                </div>
              )}

              {/* THẺ NGÂN HÀNG TAB */}
              {userDetailTab === "cards" && (
                <div>
                  <h3 className="text-lg font-bold text-slate-200 mb-4">Thẻ ngân hàng</h3>
                  <div className="bg-slate-800 rounded-lg p-4">
                    <p className="text-sm text-slate-500 text-center py-8">Chưa liên kết thẻ ngân hàng</p>
                  </div>
                </div>
              )}

              {/* USDT TAB */}
              {userDetailTab === "usdt" && (
                <div>
                  <h3 className="text-lg font-bold text-slate-200 mb-4">Ví USDT</h3>
                  <div className="bg-slate-800 rounded-lg p-4">
                    <p className="text-sm text-slate-500 text-center py-8">Chưa liên kết ví USDT</p>
                  </div>
                </div>
              )}

              {/* ĐỊA CHỈ TAB */}
              {userDetailTab === "address" && (
                <div>
                  <h3 className="text-lg font-bold text-slate-200 mb-4">Địa chỉ giao hàng</h3>
                  <div className="bg-slate-800 rounded-lg p-4">
                    <p className="text-sm text-slate-500 text-center py-8">Chưa có địa chỉ giao hàng</p>
                  </div>
                </div>
              )}

              {/* LỊCH SỬ TAB */}
              {userDetailTab === "logs" && (
                <div>
                  <h3 className="text-lg font-bold text-slate-200 mb-4">Lịch sử hoạt động</h3>
                  <div className="bg-slate-800 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-slate-500">{new Date().toLocaleString("vi-VN")}</span>
                        <span className="text-slate-400">Tài khoản được xem bởi Banker</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-slate-500">{selectedUser.registrationDate}</span>
                        <span className="text-slate-400">Tài khoản được tạo</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT FORM MODAL */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">✏️ Chỉnh sửa thông tin người dùng</h2>
              <button
                onClick={() => setShowEditForm(false)}
                className="text-white hover:text-slate-200 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Column 1 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Đại lý <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.agentId}
                      onChange={(e) => setEditFormData({ ...editFormData, agentId: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                      placeholder="agentcc"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Đại lý cấp hai <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.subAgentId}
                      onChange={(e) => setEditFormData({ ...editFormData, subAgentId: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                      placeholder="10033"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Tên người dùng <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.username}
                      onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                      placeholder="Demo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Số điện thoại <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                      placeholder="Demo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Số dư tài khoản <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.balance}
                      onChange={(e) => setEditFormData({ ...editFormData, balance: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                      placeholder="13701.52"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Điểm tín dụng <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={editFormData.creditScore}
                      onChange={(e) => setEditFormData({ ...editFormData, creditScore: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Số tiền đóng lạnh <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.frozenBalance}
                      onChange={(e) => setEditFormData({ ...editFormData, frozenBalance: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Cấp độ thành viên <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={editFormData.vipLevel}
                      onChange={(e) => setEditFormData({ ...editFormData, vipLevel: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                      title="Cấp độ thành viên"
                    >
                      <option value="VIP1">VIP 1</option>
                      <option value="VIP2">VIP 2</option>
                      <option value="VIP3">VIP 3</option>
                      <option value="VIP4">VIP 4</option>
                      <option value="VIP5">VIP 5</option>
                      <option value="VIP6">VIP 6</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Trạng thái giao dịch <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={editFormData.transactionStatus}
                      onChange={(e) => setEditFormData({ ...editFormData, transactionStatus: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                      title="Trạng thái giao dịch"
                    >
                      <option value="活性">活性 (Hoạt động)</option>
                      <option value="正常">正常 (Bình thường)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Trạng thái kiểm soát <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={editFormData.controlStatus}
                      onChange={(e) => setEditFormData({ ...editFormData, controlStatus: e.target.value as "active" | "inactive" | "suspended" })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                      title="Trạng thái kiểm soát"
                    >
                      <option value="active">正常 (Hoạt động)</option>
                      <option value="inactive">Đình chỉ</option>
                      <option value="suspended">Bị khóa</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      ⚠️ Kiểm soát việc người dùng có thể chấp nhận đơn hàng hay không.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Mật khẩu đăng nhập <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.password}
                      onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                      placeholder="Để trống nếu không thay đổi mật khẩu"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Mật khẩu giao dịch <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      value={editFormData.transactionPassword}
                      onChange={(e) => setEditFormData({ ...editFormData, transactionPassword: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                      placeholder="Để trống nếu không thay đổi mật khẩu giao dịch"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Số lượng nhiệm vụ cấp <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={editFormData.taskQuota}
                      onChange={(e) => setEditFormData({ ...editFormData, taskQuota: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                      placeholder="0"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Nhiệm vụ và hiện tại đã hoàn thành được, đếm lùi nhiều vòng?<br/>
                      1. Tích lũy số lượng nhiệm vụ hàng ngày<br/>
                      2. Tích lũy số lượng nhiệm vụ ở các giai đoạn.<br/>
                      3. Tức là tổng số nhiệm vụ đã hoàn thành của từng mức độ hàng ngày.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-850 px-6 py-4 flex justify-end gap-3 border-t border-slate-700">
              <button
                onClick={() => setShowEditForm(false)}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={async () => {
                  // Validate required fields
                  if (!editFormData.agentId || !editFormData.username || !editFormData.phone) {
                    alert("❌ Vui lòng điền đầy đủ các trường bắt buộc!");
                    return;
                  }

                  try {
                    console.log('💾 Đang lưu thông tin user...');
                    
                    // Tìm user hiện tại để lấy user_id
                    const currentUser = users.find(u => u.id === editFormData.id);
                    if (!currentUser || !currentUser.user_id) {
                      alert("❌ Không tìm thấy user_id của user!");
                      return;
                    }

                    // GỬI LÊN SUPABASE
                    const result = await updateUserByBanker(currentUser.user_id, {
                      username: editFormData.agentId,
                      fullName: editFormData.username,
                      phone: editFormData.phone,
                      walletBalance: editFormData.balance,
                      creditScore: editFormData.creditScore,
                      vipLevel: editFormData.vipLevel,
                      status: editFormData.controlStatus,
                      password: editFormData.password || currentUser.password,
                      withdrawalPassword: editFormData.transactionPassword || undefined,
                      orderQuotaMax: editFormData.taskQuota
                    });

                    if (!result.success) {
                      console.error('❌ Lỗi khi cập nhật Supabase:', result.error);
                      alert(`❌ Lỗi Supabase: ${result.error}\n\nĐã lưu vào localStorage để fallback.`);
                    } else {
                      console.log('✅ User đã được cập nhật trong Supabase');
                    }

                    // CẬP NHẬT LOCALSTORAGE (backward compatibility)
                    const updatedUsers = users.map(u => 
                      u.id === editFormData.id 
                        ? { ...u, 
                            username: editFormData.agentId,
                            fullName: editFormData.username,
                            phone: editFormData.phone,
                            walletBalance: editFormData.balance,
                            balance: editFormData.balance,
                            creditScore: editFormData.creditScore,
                            vipLevel: editFormData.vipLevel,
                            status: editFormData.controlStatus,
                            password: editFormData.password || u.password,
                            withdrawalPassword: editFormData.transactionPassword || u.withdrawalPassword,
                            orderQuotaMax: editFormData.taskQuota
                          }
                        : u
                    );
                    setUsers(updatedUsers);
                    
                    // Save to localStorage
                    saveUsersToStorage(updatedUsers);
                    
                    // Close form and show success
                    setShowEditForm(false);
                    alert("✅ Thông tin người dùng đã được cập nhật thành công!");
                    
                    // Refresh user detail if it's still open
                    if (selectedUser && selectedUser.id === editFormData.id) {
                      const updated = updatedUsers.find(u => u.id === editFormData.id);
                      if (updated) setSelectedUser(updated);
                    }
                  } catch (error) {
                    console.error('❌ Exception khi cập nhật user:', error);
                    alert("❌ Có lỗi xảy ra! Vui lòng thử lại.");
                  }
                }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                💾 Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISTRIBUTE ORDERS MODAL - Modal phân phối đơn hàng */}
      {showDistributeModal && selectedUserForOrders && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">📦 Phân phối đơn hàng</h2>
              <button
                onClick={() => setShowDistributeModal(false)}
                className="text-white hover:text-slate-200 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* User Info */}
              <div className="bg-slate-800 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Thông tin người dùng</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-500">Tài khoản:</span>
                    <span className="ml-2 text-slate-200 font-semibold">{selectedUserForOrders.username}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Tên đầy đủ:</span>
                    <span className="ml-2 text-slate-200 font-semibold">{selectedUserForOrders.fullName || "-"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Cấp VIP:</span>
                    <span className="ml-2 text-purple-400 font-semibold">{selectedUserForOrders.vipLevel}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Số dư:</span>
                    <span className="ml-2 text-emerald-400 font-semibold">${selectedUserForOrders.balance.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Order Quantity Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Số lượng đơn hàng <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-lg text-center font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
                  placeholder="Nhập số lượng (không giới hạn)"
                />
                <p className="text-xs text-slate-500 mt-2">
                  💡 Hệ thống sẽ tự động chọn ngẫu nhiên đơn hàng từ danh sách {orderTemplates.length} mẫu có sẵn
                </p>
              </div>

              {/* Available Order Templates Preview */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Danh sách đơn hàng có sẵn ({orderTemplates.length} mẫu)</h3>
                <div className="bg-slate-800 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {orderTemplates.map((template, idx) => (
                      <div key={template.id} className="flex items-center justify-between p-2 bg-slate-750 rounded text-xs">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-200">{idx + 1}. {template.name}</p>
                          <p className="text-slate-500 text-[10px] mt-0.5">{template.productName}</p>
                        </div>
                        <div className="text-right ml-3">
                          <p className="text-emerald-400 font-bold text-[10px]">💰 Giá ngẫu nhiên</p>
                          <p className="text-amber-400 text-[10px]">📊 Theo cấp VIP</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* VIP Rates Info */}
              {selectedUserForOrders && (
                <div className="mb-6 bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">⭐</span>
                    <div>
                      <p className="text-sm font-semibold text-amber-400">
                        {selectedUserForOrders.vipLevel || "VIP1"} - {selectedUserForOrders.fullName || selectedUserForOrders.username}
                      </p>
                      <p className="text-xs text-slate-400">Chiết khấu và hoa hồng theo cấp bậc</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="bg-slate-800/50 rounded-lg p-2">
                      <p className="text-[10px] text-slate-400 mb-1">Chiết khấu</p>
                      <p className="text-sm font-bold text-emerald-400">
                        {(getVipRates(selectedUserForOrders.vipLevel || "VIP1").discount * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-2">
                      <p className="text-[10px] text-slate-400 mb-1">Hoa hồng</p>
                      <p className="text-sm font-bold text-amber-400">
                        {(getVipRates(selectedUserForOrders.vipLevel || "VIP1").commission * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-850 px-6 py-4 flex justify-end gap-3 border-t border-slate-700">
              <button
                onClick={() => setShowDistributeModal(false)}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => distributeOrdersToUser(selectedUserForOrders, orderQuantity)}
                disabled={orderQuantity < 1}
                className={`px-6 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  orderQuantity >= 1
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-slate-600 text-slate-400 cursor-not-allowed"
                }`}
              >
                📦 Phân phối {orderQuantity} đơn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK ORDER DISTRIBUTION MODAL - Phát đơn hàng loạt cho tất cả users */}
      {showBulkDistributeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl max-w-2xl w-full border-2 border-purple-500/30 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">📦 Phát đơn hàng loạt cho tất cả users</h2>
              <button
                onClick={() => setShowBulkDistributeModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Thống kê users */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-5 border border-purple-500/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-300">📊 Thống kê</h3>
                  <span className="text-xs px-2 py-1 bg-purple-500/20 rounded-full text-purple-300 border border-purple-500/30">
                    Hệ thống
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-400 mb-1">Tổng users</p>
                    <p className="text-2xl font-bold text-white">{users.length}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-400 mb-1">Users có số dư</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {users.filter(u => u.balance > 0 && u.status === "active").length}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-400 mb-1">Tổng đơn sẽ tạo</p>
                    <p className="text-2xl font-bold text-pink-400">
                      {users.filter(u => u.balance > 0 && u.status === "active").length * bulkOrderQuantity}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form nhập liệu */}
              <div className="space-y-4">
                {/* Số lượng đơn mỗi user */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    📦 Số lượng đơn cho MỖI user
                  </label>
                  <input
                    type="number"
                    value={bulkOrderQuantity}
                    onChange={(e) => setBulkOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-lg font-bold focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <p className="text-xs text-slate-400 mt-1">Không giới hạn - Nhập số lượng bất kỳ</p>
                </div>

                {/* Khoảng giá */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">💰 Cài đặt giá đơn hàng</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Giá tối thiểu (USD)</label>
                      <input
                        type="number"
                        value={bulkMinPrice || ""}
                        onChange={(e) => setBulkMinPrice(e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder="Auto (30% số dư)"
                        step="0.01"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Giá tối đa (USD)</label>
                      <input
                        type="number"
                        value={bulkMaxPrice || ""}
                        onChange={(e) => setBulkMaxPrice(e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder="Auto (90% số dư)"
                        step="0.01"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                    <p className="text-xs text-purple-300">
                      ℹ️ Để trống = tự động tính theo % số dư của mỗi user
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      • Min auto: 30% số dư user<br/>
                      • Max auto: 90% số dư user
                    </p>
                  </div>
                </div>

                {/* Cảnh báo */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="text-sm font-semibold text-amber-300 mb-1">Lưu ý quan trọng</p>
                      <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                        <li>• Chỉ phát đơn cho users có <strong>số dư &gt; 0</strong> và <strong>trạng thái active</strong></li>
                        <li>• Giá đơn sẽ <strong>ngẫu nhiên</strong> trong khoảng đã thiết lập</li>
                        <li>• Giá đơn <strong>không vượt quá số dư</strong> của user</li>
                        <li>• Chiết khấu &amp; hoa hồng tự động theo <strong>cấp VIP</strong></li>
                        <li>• Đơn hàng sẽ <strong>đồng bộ ngay lập tức</strong> vào app</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-850 px-6 py-4 flex justify-end gap-3 border-t border-slate-700">
              <button
                onClick={() => setShowBulkDistributeModal(false)}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={distributeBulkOrders}
                disabled={bulkOrderQuantity < 1}
                className={`px-6 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                  bulkOrderQuantity >= 1
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-slate-600 text-slate-400 cursor-not-allowed"
                }`}
              >
                <span>🚀</span>
                <span>Phát {users.filter(u => u.balance > 0 && u.status === "active").length * bulkOrderQuantity} đơn ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 💉 MODAL TIÊM ĐƠN */}
      {showInjectModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>💉</span>
                  <span>Thêm Lệnh Tiêm Đơn</span>
                </h3>
                {selectedUserForInject && (
                  <p className="text-sm text-emerald-400 mt-1">
                    👤 Cho user: <span className="font-bold">{selectedUserForInject.fullName}</span> ({selectedUserForInject.username})
                  </p>
                )}
              </div>
              <button 
                onClick={() => {
                  setShowInjectModal(false);
                  setSelectedUserForInject(null);
                }}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Ngày tiêm */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  📅 Ngày tiêm
                </label>
                <input
                  type="date"
                  value={injectFormData.injectDate}
                  onChange={(e) => setInjectFormData({...injectFormData, injectDate: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
                <p className="text-xs text-slate-500 mt-1">Thời điểm hệ thống bắt đầu phân đơn</p>
              </div>

              {/* Lệnh tiêm */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  🎯 Lệnh tiêm
                </label>
                <select
                  value={injectFormData.injectMode}
                  onChange={(e) => setInjectFormData({...injectFormData, injectMode: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value={0}>0 - Tiêm tiếp theo (Default)</option>
                  <option value={1}>1 - Tiêm ngay lập tức</option>
                  <option value={2}>2 - Tiêm theo lịch</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">Chế độ/phương thức tiêm đơn</p>
              </div>

              {/* Phạm vi tiêm (requiredBalance) */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  💰 Phạm vi tiêm (requiredBalance)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={injectFormData.requiredBalance}
                  onChange={(e) => setInjectFormData({...injectFormData, requiredBalance: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="VD: 50000"
                />
                <p className="text-xs text-slate-500 mt-1">
                  ⚠️ Số tiền tối thiểu user cần có. <span className="text-amber-400">TIÊM VƯỢT VỐN được phép!</span>
                </p>
              </div>

              {/* Tỷ lệ hoa hồng */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  📊 Tỷ lệ hoa hồng (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={injectFormData.commissionRate}
                  onChange={(e) => setInjectFormData({...injectFormData, commissionRate: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="VD: 5"
                />
                <p className="text-xs text-slate-500 mt-1">commission = orderAmount × rate / 100</p>
              </div>

              {/* Warning Box */}
              <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg p-4">
                <p className="text-sm text-amber-300 font-semibold mb-2">⚠️ LƯU Ý QUAN TRỌNG:</p>
                <ul className="text-xs text-amber-200/80 space-y-1 list-disc list-inside">
                  <li>Lệnh tiêm này <strong>CHỈ ÁP DỤNG CHO USER: {selectedUserForInject?.fullName}</strong></li>
                  <li>Backend <strong>KHÔNG kiểm tra số dư</strong> user khi tiêm</li>
                  <li>App sẽ <strong>hiển thị warning</strong> nếu thiếu vốn nhưng <strong>VẪN cho phép gửi đơn</strong></li>
                  <li>Đây là tính năng <strong>TIÊM ĐƠN VƯỢT VỐN</strong> - Banker quyết định!</li>
                  <li>Commission và quota trừ bình thường, <strong>ví KHÔNG bị trừ</strong></li>
                </ul>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInjectModal(false)}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleInjectSubmit}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-lg font-semibold transition-colors"
              >
                🚀 Nộp lệnh tiêm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrap with LanguageProvider
const BankerDashboardWithLanguage = () => (
  <LanguageProvider>
    <BankerDashboard />
  </LanguageProvider>
);

export default BankerDashboardWithLanguage;
