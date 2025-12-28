// ==================== TRANSLATIONS ====================
// Hệ thống đa ngôn ngữ: Tiếng Việt, English, 中文

export type Language = 'vi' | 'en' | 'zh';

export interface Translations {
  // Common
  common: {
    appName: string;
    welcome: string;
    confirm: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    back: string;
    next: string;
    submit: string;
    loading: string;
    success: string;
    error: string;
    yes: string;
    no: string;
    time: string;
  };

  // Auth
  auth: {
    login: string;
    register: string;
    logout: string;
    username: string;
    password: string;
    confirmPassword: string;
    transactionPassword: string;
    authCode: string;
    fullName: string;
    phone: string;
    email: string;
    loginSuccess: string;
    loginFailed: string;
    registerSuccess: string;
    registerFailed: string;
    forgotPassword: string;
    rememberMe: string;
  };

  // Navigation
  nav: {
    home: string;
    orders: string;
    wallet: string;
    profile: string;
    dashboard: string;
  };

  // Wallet
  wallet: {
    title: string;
    balance: string;
    available: string;
    frozen: string;
    deposit: string;
    withdraw: string;
    depositAmount: string;
    withdrawAmount: string;
    depositSuccess: string;
    withdrawSuccess: string;
    minDeposit: string;
    maxDeposit: string;
    transactionHistory: string;
    pending: string;
    completed: string;
    failed: string;
  };

  // Orders
  orders: {
    title: string;
    newOrder: string;
    orderList: string;
    orderValue: string;
    commission: string;
    status: string;
    completeOrder: string;
    pendingOrders: string;
    completedOrders: string;
    totalEarnings: string;
    noOrders: string;
  };

  // Profile
  profile: {
    title: string;
    myProfile: string;
    accountInfo: string;
    vipLevel: string;
    creditScore: string;
    accountStatus: string;
    security: string;
    changePassword: string;
    settings: string;
    language: string;
    selectLanguage: string;
  };

  // Banker Dashboard
  banker: {
    title: string;
    dashboard: string;
    controlPanel: string;
    userManagement: string;
    orderManagement: string;
    transactionManagement: string;
    totalUsers: string;
    activeUsers: string;
    totalOrders: string;
    pendingTransactions: string;
    approveDeposit: string;
    rejectDeposit: string;
    approveWithdraw: string;
    rejectWithdraw: string;
    assignOrder: string;
    bulkAssign: string;
    viewDetails: string;
  };

  // Status
  status: {
    active: string;
    inactive: string;
    suspended: string;
    pending: string;
    approved: string;
    rejected: string;
    completed: string;
    processing: string;
  };

  // Messages
  messages: {
    confirmAction: string;
    deleteConfirm: string;
    saveSuccess: string;
    saveFailed: string;
    noData: string;
    loadingData: string;
    networkError: string;
    loginEmptyFields: string;
    loginUserNotFound: string;
    loginWrongPassword: string;
    loginSuccess: string;
    registerEmptyFields: string;
    registerUserExists: string;
    registerPasswordMismatch: string;
    registerSuccess: string;
  };
}

// ==================== VIETNAMESE ====================
export const vi: Translations = {
  common: {
    appName: 'SCLM',
    welcome: 'Chào mừng',
    confirm: 'Xác nhận',
    cancel: 'Hủy',
    save: 'Lưu',
    delete: 'Xóa',
    edit: 'Sửa',
    close: 'Đóng',
    back: 'Quay lại',
    next: 'Tiếp theo',
    submit: 'Gửi',
    loading: 'Đang tải...',
    success: 'Thành công',
    error: 'Lỗi',
    yes: 'Có',
    no: 'Không',
    time: 'Giờ địa phương',
  },
  auth: {
    login: 'Đăng nhập',
    register: 'Đăng ký',
    logout: 'Đăng xuất',
    username: 'Tên đăng nhập',
    password: 'Mật khẩu',
    confirmPassword: 'Xác nhận mật khẩu',
    transactionPassword: 'Mật khẩu giao dịch',
    authCode: 'Mã ủy quyền',
    fullName: 'Họ và tên',
    phone: 'Số điện thoại',
    email: 'Email',
    loginSuccess: 'Đăng nhập thành công!',
    loginFailed: 'Đăng nhập thất bại!',
    registerSuccess: 'Đăng ký thành công!',
    registerFailed: 'Đăng ký thất bại!',
    forgotPassword: 'Quên mật khẩu?',
    rememberMe: 'Ghi nhớ đăng nhập',
  },
  nav: {
    home: 'Trang chủ',
    orders: 'Đơn hàng',
    wallet: 'Ví',
    profile: 'Tài khoản',
    dashboard: 'Bảng điều khiển',
  },
  wallet: {
    title: 'Ví của tôi',
    balance: 'Số dư',
    available: 'Khả dụng',
    frozen: 'Đóng băng',
    deposit: 'Nạp tiền',
    withdraw: 'Rút tiền',
    depositAmount: 'Số tiền nạp',
    withdrawAmount: 'Số tiền rút',
    depositSuccess: 'Nạp tiền thành công!',
    withdrawSuccess: 'Rút tiền thành công!',
    minDeposit: 'Tối thiểu',
    maxDeposit: 'Tối đa',
    transactionHistory: 'Lịch sử giao dịch',
    pending: 'Đang chờ',
    completed: 'Hoàn thành',
    failed: 'Thất bại',
  },
  orders: {
    title: 'Đơn hàng',
    newOrder: 'Đơn mới',
    orderList: 'Danh sách đơn',
    orderValue: 'Giá trị đơn',
    commission: 'Hoa hồng',
    status: 'Trạng thái',
    completeOrder: 'Hoàn thành đơn',
    pendingOrders: 'Đơn chờ',
    completedOrders: 'Đơn hoàn thành',
    totalEarnings: 'Tổng thu nhập',
    noOrders: 'Chưa có đơn hàng',
  },
  profile: {
    title: 'Tài khoản',
    myProfile: 'Hồ sơ của tôi',
    accountInfo: 'Thông tin tài khoản',
    vipLevel: 'Cấp VIP',
    creditScore: 'Điểm tín dụng',
    accountStatus: 'Trạng thái',
    security: 'Bảo mật',
    changePassword: 'Đổi mật khẩu',
    settings: 'Cài đặt',
    language: 'Ngôn ngữ',
    selectLanguage: 'Chọn ngôn ngữ',
  },
  banker: {
    title: 'Banker Dashboard',
    dashboard: 'Bảng điều khiển',
    controlPanel: 'Banker Control Panel - Quản lý toàn diện',
    userManagement: 'Quản lý người dùng',
    orderManagement: 'Quản lý đơn hàng',
    transactionManagement: 'Quản lý giao dịch',
    totalUsers: 'Tổng người dùng',
    activeUsers: 'Người dùng hoạt động',
    totalOrders: 'Tổng đơn hàng',
    pendingTransactions: 'Giao dịch chờ',
    approveDeposit: 'Duyệt nạp',
    rejectDeposit: 'Từ chối nạp',
    approveWithdraw: 'Duyệt rút',
    rejectWithdraw: 'Từ chối rút',
    assignOrder: 'Phân đơn',
    bulkAssign: 'Phân hàng loạt',
    viewDetails: 'Xem chi tiết',
  },
  status: {
    active: 'Hoạt động',
    inactive: 'Không hoạt động',
    suspended: 'Đình chỉ',
    pending: 'Đang chờ',
    approved: 'Đã duyệt',
    rejected: 'Đã từ chối',
    completed: 'Hoàn thành',
    processing: 'Đang xử lý',
  },
  messages: {
    confirmAction: 'Bạn có chắc chắn muốn thực hiện hành động này?',
    deleteConfirm: 'Bạn có chắc chắn muốn xóa?',
    saveSuccess: 'Lưu thành công!',
    saveFailed: 'Lưu thất bại!',
    noData: 'Không có dữ liệu',
    loadingData: 'Đang tải dữ liệu...',
    networkError: 'Lỗi kết nối mạng',
    loginEmptyFields: 'Vui lòng nhập đầy đủ tài khoản và mật khẩu!',
    loginUserNotFound: 'Tài khoản không tồn tại!',
    loginWrongPassword: 'Mật khẩu không đúng!',
    loginSuccess: 'Đăng nhập thành công!',
    registerEmptyFields: 'Vui lòng nhập đầy đủ thông tin!',
    registerUserExists: 'Tài khoản đã tồn tại!',
    registerPasswordMismatch: 'Mật khẩu xác nhận không khớp!',
    registerSuccess: 'Đăng ký thành công!',
  },
};

// ==================== ENGLISH ====================
export const en: Translations = {
  common: {
    appName: 'SCLM',
    welcome: 'Welcome',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    yes: 'Yes',
    no: 'No',
    time: 'Local Time',
  },
  auth: {
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    username: 'Username',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    transactionPassword: 'Transaction Password',
    authCode: 'Authorization Code',
    fullName: 'Full Name',
    phone: 'Phone',
    email: 'Email',
    loginSuccess: 'Login successful!',
    loginFailed: 'Login failed!',
    registerSuccess: 'Registration successful!',
    registerFailed: 'Registration failed!',
    forgotPassword: 'Forgot password?',
    rememberMe: 'Remember me',
  },
  nav: {
    home: 'Home',
    orders: 'Orders',
    wallet: 'Wallet',
    profile: 'Profile',
    dashboard: 'Dashboard',
  },
  wallet: {
    title: 'My Wallet',
    balance: 'Balance',
    available: 'Available',
    frozen: 'Frozen',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    depositAmount: 'Deposit Amount',
    withdrawAmount: 'Withdraw Amount',
    depositSuccess: 'Deposit successful!',
    withdrawSuccess: 'Withdrawal successful!',
    minDeposit: 'Minimum',
    maxDeposit: 'Maximum',
    transactionHistory: 'Transaction History',
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed',
  },
  orders: {
    title: 'Orders',
    newOrder: 'New Order',
    orderList: 'Order List',
    orderValue: 'Order Value',
    commission: 'Commission',
    status: 'Status',
    completeOrder: 'Complete Order',
    pendingOrders: 'Pending Orders',
    completedOrders: 'Completed Orders',
    totalEarnings: 'Total Earnings',
    noOrders: 'No orders yet',
  },
  profile: {
    title: 'Profile',
    myProfile: 'My Profile',
    accountInfo: 'Account Info',
    vipLevel: 'VIP Level',
    creditScore: 'Credit Score',
    accountStatus: 'Status',
    security: 'Security',
    changePassword: 'Change Password',
    settings: 'Settings',
    language: 'Language',
    selectLanguage: 'Select Language',
  },
  banker: {
    title: 'Banker Dashboard',
    dashboard: 'Admin Dashboard',
    controlPanel: 'Banker Control Panel - Comprehensive Management',
    userManagement: 'User Management',
    orderManagement: 'Order Management',
    transactionManagement: 'Transaction Management',
    totalUsers: 'Total Users',
    activeUsers: 'Active Users',
    totalOrders: 'Total Orders',
    pendingTransactions: 'Pending Transactions',
    approveDeposit: 'Approve Deposit',
    rejectDeposit: 'Reject Deposit',
    approveWithdraw: 'Approve Withdraw',
    rejectWithdraw: 'Reject Withdraw',
    assignOrder: 'Assign Order',
    bulkAssign: 'Bulk Assign',
    viewDetails: 'View Details',
  },
  status: {
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
    processing: 'Processing',
  },
  messages: {
    confirmAction: 'Are you sure you want to perform this action?',
    deleteConfirm: 'Are you sure you want to delete?',
    saveSuccess: 'Saved successfully!',
    saveFailed: 'Save failed!',
    noData: 'No data',
    loadingData: 'Loading data...',
    networkError: 'Network error',
    loginEmptyFields: 'Please enter both username and password!',
    loginUserNotFound: 'Account does not exist!',
    loginWrongPassword: 'Incorrect password!',
    loginSuccess: 'Login successful!',
    registerEmptyFields: 'Please fill in all fields!',
    registerUserExists: 'Account already exists!',
    registerPasswordMismatch: 'Passwords do not match!',
    registerSuccess: 'Registration successful!',
  },
};

// ==================== CHINESE (中文) ====================
export const zh: Translations = {
  common: {
    appName: 'SCLM',
    welcome: '欢迎',
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    close: '关闭',
    back: '返回',
    next: '下一步',
    submit: '提交',
    loading: '加载中...',
    success: '成功',
    error: '错误',
    yes: '是',
    no: '否',
    time: '本地时间',
  },
  auth: {
    login: '登录',
    register: '注册',
    logout: '登出',
    username: '用户名',
    password: '密码',
    confirmPassword: '确认密码',
    transactionPassword: '交易密码',
    authCode: '授权码',
    fullName: '姓名',
    phone: '电话',
    email: '邮箱',
    loginSuccess: '登录成功！',
    loginFailed: '登录失败！',
    registerSuccess: '注册成功！',
    registerFailed: '注册失败！',
    forgotPassword: '忘记密码？',
    rememberMe: '记住我',
  },
  nav: {
    home: '首页',
    orders: '订单',
    wallet: '钱包',
    profile: '个人',
    dashboard: '控制台',
  },
  wallet: {
    title: '我的钱包',
    balance: '余额',
    available: '可用',
    frozen: '冻结',
    deposit: '充值',
    withdraw: '提现',
    depositAmount: '充值金额',
    withdrawAmount: '提现金额',
    depositSuccess: '充值成功！',
    withdrawSuccess: '提现成功！',
    minDeposit: '最低',
    maxDeposit: '最高',
    transactionHistory: '交易历史',
    pending: '待处理',
    completed: '已完成',
    failed: '失败',
  },
  orders: {
    title: '订单',
    newOrder: '新订单',
    orderList: '订单列表',
    orderValue: '订单金额',
    commission: '佣金',
    status: '状态',
    completeOrder: '完成订单',
    pendingOrders: '待处理订单',
    completedOrders: '已完成订单',
    totalEarnings: '总收入',
    noOrders: '暂无订单',
  },
  profile: {
    title: '个人中心',
    myProfile: '我的资料',
    accountInfo: '账户信息',
    vipLevel: 'VIP等级',
    creditScore: '信用分',
    accountStatus: '状态',
    security: '安全',
    changePassword: '修改密码',
    settings: '设置',
    language: '语言',
    selectLanguage: '选择语言',
  },
  banker: {
    title: '管理后台',
    dashboard: '管理控制台',
    controlPanel: '银行家控制面板 - 综合管理',
    userManagement: '用户管理',
    orderManagement: '订单管理',
    transactionManagement: '交易管理',
    totalUsers: '总用户数',
    activeUsers: '活跃用户',
    totalOrders: '总订单数',
    pendingTransactions: '待处理交易',
    approveDeposit: '批准充值',
    rejectDeposit: '拒绝充值',
    approveWithdraw: '批准提现',
    rejectWithdraw: '拒绝提现',
    assignOrder: '分配订单',
    bulkAssign: '批量分配',
    viewDetails: '查看详情',
  },
  status: {
    active: '活跃',
    inactive: '未激活',
    suspended: '暂停',
    pending: '待处理',
    approved: '已批准',
    rejected: '已拒绝',
    completed: '已完成',
    processing: '处理中',
  },
  messages: {
    confirmAction: '您确定要执行此操作吗？',
    deleteConfirm: '您确定要删除吗？',
    saveSuccess: '保存成功！',
    saveFailed: '保存失败！',
    noData: '无数据',
    loadingData: '加载数据中...',
    networkError: '网络错误',
    loginEmptyFields: '请输入完整的账号和密码！',
    loginUserNotFound: '账户不存在！',
    loginWrongPassword: '密码错误！',
    loginSuccess: '登录成功！',
    registerEmptyFields: '请填写完整信息！',
    registerUserExists: '账户已存在！',
    registerPasswordMismatch: '确认密码不匹配！',
    registerSuccess: '注册成功！',
  },
};

// ==================== TRANSLATIONS MAP ====================
export const translations: Record<Language, Translations> = {
  vi,
  en,
  zh,
};

// ==================== LANGUAGE HELPER ====================
export const getTranslation = (lang: Language): Translations => {
  return translations[lang] || translations.vi;
};
