import React, { useMemo, useState } from "react";
import "./OrdersScreen.css";
import { Product, formatCurrency } from "../data";

interface Order {
  id: string;
  name: string;
  amount: number;
  status: string;
  shortage?: number;
  commission?: number;
}

// CSKH contact - Open chat widget
const CSKH_LINK = "https://chatlink.ichatlinks.net/widget/standalone.html?eid=f06e847ab6e5b72774424ffe3fea3f46&language=en";

const openCSKHChat = () => {
  window.open(CSKH_LINK, '_blank', 'width=400,height=600');
};

const OrdersScreen: React.FC<{ 
  products: Product[]; 
  balance: number; 
  vipLevel: string; 
  accountName?: string;
  orderQuotaMax?: number;        // ⭐ MỚI - Số đơn tối đa
  orderQuotaUsed?: number;       // ⭐ MỚI - Số đơn đã dùng
  pendingOrders?: number;        // ⭐ MỚI - Đơn chưa xử lý
  totalCommission?: number;      // ⭐ MỚI - Tổng hoa hồng
}> = ({ 
  products, 
  balance, 
  vipLevel, 
  accountName,
  orderQuotaMax = 0,
  orderQuotaUsed = 0,
  pendingOrders = 0,
  totalCommission = 0
}) => {
  const mainProduct = products[0];

  const handleMockClick = (action: string) => window.alert(`(DEMO) Chức năng "${action}" hiện đang ở chế mô phỏng.`);

  // Load orders from localStorage - đơn được phân phối từ Banker
  const loadUserOrders = () => {
    if (!accountName) {
      // Nếu không có accountName, cảnh báo rõ ràng
      window.alert("Không tìm thấy thông tin user! Vui lòng đăng nhập lại hoặc liên hệ CSKH.");
      return [];
    }
    try {
      const allOrders = JSON.parse(localStorage.getItem("sclm_user_orders") || "[]");
      // Lọc đơn hàng của user hiện tại
      const userOrders = allOrders
        .filter((o: any) => o.username === accountName)
        .map((o: any) => ({
          id: o.id,
          name: o.shortName || o.productName,
          amount: o.price,
          status: o.status === "pending" ? "Đang chờ thanh toán" : 
                  o.status === "completed" ? "Giao dịch đã hoàn tất" : "Đang xử lý",
          shortage: o.discount,
          commission: o.commission
        }));
      return userOrders;
    } catch {
      return [];
    }
  };

  // Make orders mutable so we can update status when sending
  const [orders, setOrders] = useState<Order[]>(() => loadUserOrders());

  // Auto-refresh orders every 2 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setOrders(loadUserOrders());
    }, 2000);
    return () => clearInterval(interval);
  }, [accountName]);

  // transient toast for confirmation
  const [toast, setToast] = useState<string | null>(null);
  
  // New order notification banner
  const [newOrderNotification, setNewOrderNotification] = useState<{
    orderId: string;
    discount: number;
  } | null>(null);

  // Modal state for sending order
  const [selectedOrder, setSelectedOrder] = useState<{
    id: string;
    date: string;
    product: Product;
    total: number;
    discount: number;
  } | null>(null);

  // 📊 Thống kê - CHỈ ĐỌC TỪ PROPS (Backend/Banker quản lý)
  // ❌ KHÔNG dùng local state nữa - dùng props từ App
  // const [totalCommission, setTotalCommission] = useState<number>(0);
  // const [completedOrders, setCompletedOrders] = useState<number>(0);
  // const [pendingOrders, setPendingOrders] = useState<number>(0);
  // Số lượng đơn thực tế user đã nhận được
  const completedOrders = orders.length;

  // ⚠️ DEPRECATED - Hàm này không còn dùng vì App đã đọc từ Backend
  // Hàm nhận đơn hàng mới từ backend (sẽ được gọi khi backend push data)
  const receiveOrderFromBackend = (orderData: {
    id: string;
    name: string;
    amount: number;
    commission: number;
    status: string;
  }) => {
    // Thêm đơn hàng vào danh sách
    const newOrder = {
      id: orderData.id,
      name: orderData.name,
      amount: orderData.amount,
      status: orderData.status,
    };
    
    setOrders((prev) => [newOrder, ...prev]);
    
    // ❌ KHÔNG tự cập nhật stats nữa - Backend quản lý
    // CHỈ cập nhật thống kê KHI đơn hàng đã hoàn tất
    // if (orderData.status === "Giao dịch đã hoàn tất") {
    //   setTotalCommission((prev) => prev + orderData.commission);
    //   setCompletedOrders((prev) => prev + 1);
    //   setPendingOrders((prev) => Math.max(0, prev - 1));
    // } else if (orderData.status.includes("Đang")) {
    //   setPendingOrders((prev) => prev + 1);
    // }
  };

  // KHÔNG tự động tạo đơn - chỉ nhận từ backend
  // React.useEffect đã bị loại bỏ - thống kê CHỈ thay đổi qua receiveOrderFromBackend()

  // Trạng thái chờ đơn từ backend
  const [waitingForOrder, setWaitingForOrder] = useState<boolean>(false);

  const startWaitingForOrder = () => {
    setWaitingForOrder(true);
    setToast('🔄 Đang kiểm tra đơn hàng từ hệ thống...');
    setTimeout(() => {
      // Lấy đơn hàng mới nhất (giả lập: đơn đầu tiên trong mảng orders)
      if (orders.length === 0) {
        setWaitingForOrder(false);
        setToast('⚠️ Hiện chưa nhận được phân phối');
        setTimeout(() => setToast(null), 3000);
        return;
      }
      // Lấy đơn hàng mới nhất chưa xử lý (status: Đang chờ thanh toán hoặc pending)
      const newOrder = orders.find(o => o.status === 'Đang chờ thanh toán' || o.status === 'pending');
      if (newOrder) {
        // Tìm sản phẩm tương ứng nếu có
        const product = products.find(p => p.name === newOrder.name) || {
          id: newOrder.id,
          name: newOrder.name,
          imageUrl: '',
          price: newOrder.amount,
          description: ''
        };
        setSelectedOrder({
          id: newOrder.id,
          date: new Date().toISOString().slice(0, 19).replace('T', ' '),
          product,
          total: newOrder.amount,
          discount: newOrder.commission || 0
        });
        setToast(null);
      } else {
        setToast('✅ Không có đơn mới cần xử lý');
        setTimeout(() => setToast(null), 2000);
      }
      setWaitingForOrder(false);
    }, 1000);
  };

  // Hàm này sẽ được gọi khi backend phát đơn xuống
  const handleNewOrderFromBackend = (orderData: {
    id: string;
    productName: string;
    productImage: string;
    orderValue: number;
    commission: number;
  }) => {
    // Tạo đối tượng product tạm từ dữ liệu backend
    const product: Product = {
      id: orderData.id,
      name: orderData.productName,
      imageUrl: orderData.productImage,
      price: orderData.orderValue,
      description: ''
    };
    
    // Mở modal đơn hàng với dữ liệu thật từ backend
    setSelectedOrder({ 
      id: orderData.id, 
      date: new Date().toISOString().slice(0, 19).replace('T', ' '), 
      product: product, 
      total: orderData.orderValue, 
      discount: orderData.commission 
    });
    
    setWaitingForOrder(false);
  };

  const closeOrderModal = () => setSelectedOrder(null);

  // Modal cảnh báo vi phạm luật chơi
  const [violationModal, setViolationModal] = useState<{ title: string; message: string } | null>(null);

  const sendOrder = () => {
    if (!selectedOrder) return;

    // Kiểm tra accountName trước khi gửi đơn
    if (!accountName) {
      setViolationModal({
        title: 'Không tìm thấy thông tin user',
        message: 'Vui lòng đăng nhập lại hoặc liên hệ CSKH để tiếp tục.'
      });
      setSelectedOrder(null);
      return;
    }

    // Kiểm tra trạng thái user (giả định có prop status, quota...)
    // Nếu cần, truyền thêm props từ cha hoặc lấy từ context
    const userStatus = typeof status === 'string' ? status : 'active';
    if (userStatus !== 'active') {
      setViolationModal({
        title: 'Tài khoản bị khóa/tạm ngưng',
        message: 'Tài khoản của bạn hiện không thể nhận đơn. Vui lòng liên hệ CSKH để biết thêm chi tiết.'
      });
      setSelectedOrder(null);
      return;
    }

    // Kiểm tra quota
    if (orderQuotaUsed >= orderQuotaMax) {
      setViolationModal({
        title: 'Đã hết lượt nhận đơn',
        message: 'Bạn đã sử dụng hết số lượt nhận đơn cho phép. Vui lòng liên hệ CSKH nếu cần hỗ trợ thêm.'
      });
      setSelectedOrder(null);
      return;
    }

    // Kiểm tra trạng thái đơn
    const orderInList = orders.find(o => o.id === selectedOrder.id);
    const orderStatus = orderInList ? orderInList.status : 'Đang chờ thanh toán';
    if (orderStatus !== 'Đang chờ thanh toán' && orderStatus !== 'pending') {
      setViolationModal({
        title: 'Đơn hàng không hợp lệ',
        message: 'Đơn hàng này đã được xử lý hoặc không còn hiệu lực.'
      });
      setSelectedOrder(null);
      return;
    }

    // Kiểm tra số dư
    const shortage = selectedOrder.total - balance;
    const hasEnoughBalance = balance >= selectedOrder.total;

    if (hasEnoughBalance) {
      // GỬI ĐƠN HÀNG LÊN BACKEND - đợi backend xử lý và trả về kết quả
      // Backend sẽ xử lý đơn hàng và gọi receiveOrderFromBackend() khi hoàn tất

      // DEMO: Giả lập backend xử lý đơn sau 2-5 giây
      const processingTime = Math.floor(2000 + Math.random() * 3000);

      // Thêm đơn vào danh sách với trạng thái "Đang xử lý"
      const pendingOrder = {
        id: selectedOrder.id,
        name: selectedOrder.product.name,
        amount: Math.round(selectedOrder.total * 100) / 100,
        status: "Đang xử lý",
      };
      setOrders((prev) => [pendingOrder, ...prev]);
      setToast(`📤 Đã gửi đơn ${selectedOrder.id} lên hệ thống...`);

      window.setTimeout(() => {
        receiveOrderFromBackend({
          id: selectedOrder.id,
          name: selectedOrder.product.name,
          amount: Math.round(selectedOrder.total * 100) / 100,
          commission: selectedOrder.discount,
          status: "Giao dịch đã hoàn tất"
        });
        setOrders((prev) => prev.map((o) =>
          o.id === selectedOrder.id
            ? { ...o, status: "Giao dịch đã hoàn tất" }
            : o
        ));
        setNewOrderNotification({ orderId: selectedOrder.id, discount: selectedOrder.discount });
        window.setTimeout(() => setNewOrderNotification(null), 3000);
      }, processingTime);

      setSelectedOrder(null);
      window.setTimeout(() => setToast(null), 2000);
    } else {
      setViolationModal({
        title: 'Không đủ số dư',
        message: 'Số dư ví của bạn không đủ để nhận đơn này. Vui lòng nạp thêm tiền hoặc liên hệ CSKH.'
      });
      setSelectedOrder(null);
    }
  };
      {/* Modal cảnh báo vi phạm luật chơi */}
      {violationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 p-4 text-white shadow-2xl max-w-sm w-full animate-toast-enter">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-base mb-1">{violationModal.title}</div>
                <div className="text-sm text-red-100">{violationModal.message}</div>
              </div>
            </div>
            <div className="flex justify-end mt-2 gap-2">
              <button
                className="px-3 py-1 rounded bg-white/20 hover:bg-white/30 text-white text-xs font-semibold"
                onClick={() => setViolationModal(null)}
              >Đóng</button>
              <button
                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                onClick={() => { setViolationModal(null); openCSKHChat(); }}
              >Liên hệ CSKH</button>
            </div>
          </div>
        </div>
      )}

  return (
    <div className="flex-1 overflow-y-auto pb-24 relative">
      {/* Success notification overlay - only shows when user completes an order */}
      {newOrderNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white shadow-2xl max-w-sm w-full animate-toast-enter">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-base mb-1">Đã gửi đơn {newOrderNotification.orderId}</div>
                <div className="text-sm text-blue-100">
                  Tiền chiết khấu cộng: {formatCurrency(newOrderNotification.discount)} — Hoàn thành.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pt-4">
        <h1 className="text-sm font-semibold text-slate-50 mb-2 flex items-center gap-2">
          <span className="text-lg">🛒</span>
          Đặt hàng
        </h1>
        <div className="inline-flex rounded-full bg-slate-900/80 p-1 text-[11px] mb-3 border border-slate-700/70">
          {["Mới", "Đang xử lý", "Hoàn thành"].map((label, idx) => (
            <button key={label} onClick={() => handleMockClick(`Tab ${label}`)} className={`px-3 py-1 rounded-full ${idx === 0 ? "bg-white text-slate-900" : "text-slate-300"}`}>
              {label}
            </button>
          ))}
        </div>

        {mainProduct && (
          <button type="button" onClick={() => handleMockClick(`Xem banner đơn hàng: ${mainProduct.name}`)} className="w-full rounded-2xl bg-slate-900/90 overflow-hidden shadow-xl border border-slate-800 mb-4 text-left">
            <div className="aspect-[4/3] bg-slate-800">
              <img src={mainProduct.imageUrl} alt={mainProduct.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <p className="text-[11px] text-slate-200 line-clamp-2 mb-1">{mainProduct.name}</p>
              {mainProduct.description && <p className="text-[10px] text-slate-400 line-clamp-2">{mainProduct.description}</p>}
            </div>
          </button>
        )}
      </div>

      <section className="px-4 mb-4">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900/95 to-slate-950 text-slate-100 shadow-2xl px-5 py-4 border border-slate-800/80">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider ordersscreen-sfpro-wide">
              THỐNG KÊ CÁ NHÂN
            </h2>
          </div>

          {/* Thống kê */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-4 mb-4">
            <div>
              <p className="text-[10px] text-slate-500 mb-1.5 font-medium tracking-wide ordersscreen-sfpro">
                Tổng chiết khấu
              </p>
              <p className="font-semibold text-base text-slate-300 tracking-tight ordersscreen-sfpro">
                {formatCurrency(totalCommission)}
              </p>
              <p className="text-[9px] text-slate-600 mt-1 tracking-wide">Từ đơn đã hoàn tất</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 mb-1.5 font-medium tracking-wide ordersscreen-sfpro">
                Tổng tài sản
              </p>
              <p className="font-semibold text-base text-slate-300 tracking-tight ordersscreen-sfpro">
                {formatCurrency(balance)}
              </p>
              <p className="text-[9px] text-slate-600 mt-1 tracking-wide">Số dư khả dụng</p>
            </div>

            <div>
              <p className="text-[10px] text-slate-500 mb-1.5 font-medium tracking-wide ordersscreen-sfpro">
                Chưa giải quyết
              </p>
              <p className="font-semibold text-xl text-slate-300 tracking-tight ordersscreen-sfpro">
                {pendingOrders}
              </p>
              <p className="text-[9px] text-slate-600 mt-1 tracking-wide">Đơn đang xử lý</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 mb-1.5 font-medium tracking-wide ordersscreen-sfpro">
                Số lượng đơn
              </p>
              <p className="font-semibold text-xl text-slate-300 tracking-tight ordersscreen-sfpro">
                {completedOrders}
              </p>
              <p className="text-[9px] text-slate-600 mt-1 tracking-wide">Số đơn đã hoàn thành</p>
            </div>
          </div>

          {/* Cấp VIP và nút bắt đầu */}
          <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-3">
            <div className="text-[11px]">
              <p className="text-slate-500 mb-1.5">Cấp VIP</p>
              <div className="rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-400 px-3 py-2 text-sm font-bold shadow-inner">
                {vipLevel}
              </div>
              <p className="text-[9px] text-slate-600 mt-1"></p>
            </div>

            <button 
              className={`flex-1 py-3 rounded-full text-[13px] font-bold text-white shadow-lg hover:shadow-xl transition-all active:scale-95 ${
                waitingForOrder 
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600 cursor-wait' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
              }`}
              onClick={() => startWaitingForOrder()}
              disabled={waitingForOrder}
            >
              {waitingForOrder ? '🔄 Đang chờ đơn...' : 'Bắt đầu lấy đơn hàng'}
            </button>
          </div>
        </div>
      </section>

      {/* Order detail modal (example) */}
      {selectedOrder && (() => {
        const shortage = selectedOrder.total - balance;
        const hasEnoughBalance = balance >= selectedOrder.total;
        
        return (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-[340px] rounded-2xl bg-white text-slate-900 p-3 shadow-xl">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-semibold">Gửi đơn hàng</h3>
                <button className="text-slate-500 text-sm p-1" onClick={closeOrderModal}>✕</button>
              </div>

              <div className="mb-2 text-sm text-slate-700">
                <p className="text-[12px] opacity-70">Đã đến lúc phải đặt hàng gấp</p>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-[12px]">Số đơn hàng</p>
                    <p className="font-semibold text-sm">{selectedOrder.id}</p>
                  </div>
                  <div className="text-right text-[12px] text-slate-500">
                    <p>{selectedOrder.date}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mb-3 items-start">
                <div className="w-20 h-20 bg-slate-100 rounded-md overflow-hidden flex-shrink-0">
                  <img src={selectedOrder.product.imageUrl} alt={selectedOrder.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium line-clamp-3">{selectedOrder.product.name}</p>
                  <div className="mt-2 text-sm text-slate-600">
                    <div>Giá trị đơn hàng</div>
                    <div className="font-semibold text-base">{formatCurrency(selectedOrder.total)}</div>
                  </div>
                  <div className="mt-2 text-sm text-slate-600">
                    <div>Tiền chiết khấu</div>
                    <div className="font-semibold text-amber-600">{formatCurrency(selectedOrder.discount)}</div>
                  </div>
                  
                  {/* Show balance status */}
                  <div className="mt-3 pt-2 border-t border-slate-200">
                    <div className="text-sm text-slate-600">
                      <div className="mb-1">Số dư hiện tại</div>
                      <div className="font-semibold text-base text-slate-900">{formatCurrency(balance)}</div>
                    </div>
                    
                    {!hasEnoughBalance && (
                      <div className="mt-2 text-sm">
                        <div className="text-slate-600">Còn thiếu</div>
                        <div className="font-bold text-lg text-red-600">{formatCurrency(shortage)}</div>
                        <p className="mt-1 text-xs text-red-500">⚠️ Không đủ tiền. Vui lòng liên hệ CSKH để nạp tiền</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-end">
                <button onClick={closeOrderModal} className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm">Hủy bỏ</button>
                <button 
                  onClick={sendOrder} 
                  className={`px-4 py-2 rounded-full font-semibold text-sm ${
                    hasEnoughBalance 
                      ? 'bg-gradient-to-r from-violet-300 to-violet-400 text-white' 
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                  }`}
                >
                  {hasEnoughBalance ? 'Gửi đơn hàng' : 'Liên hệ nạp tiền'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Đơn hàng đang xử lý - auto scroll */}
      <section className="px-4 mb-4 overflow-hidden">
        <div className="mb-2">
          <h2 className="text-xs font-semibold text-slate-100">Đơn hàng đang xử lý</h2>
        </div>
        <div className="relative">
          <style>{`
            @keyframes scroll-processing {
              0% {
                transform: translateY(0);
              }
              100% {
                transform: translateY(-50%);
              }
            }
            .scroll-processing-container {
              animation: scroll-processing 60s linear infinite;
            }
            .scroll-processing-container:hover {
              animation-play-state: paused;
            }
          `}</style>
          <div className="overflow-hidden max-h-[200px]">
            <div className="scroll-processing-container">
              {/* Lặp 2 lần để tạo hiệu ứng vô tận */}
              {[...Array(2)].map((_, duplicateIndex) => (
                <div key={duplicateIndex}>
                  <div className="bg-slate-900/40 border border-slate-700/50 rounded-lg mb-2 p-2">
                    <div className="flex items-start justify-between gap-2 text-[10px]">
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-400 mb-0.5">****9472</p>
                        <p className="text-slate-200 line-clamp-2">B Braun Needle Disposable Sterican Needle Acne Needle (0.40 x 12 mm) x 100 pcs</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-slate-400">USDT</p>
                        <p className="text-emerald-400 font-semibold">9873.8</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-900/40 border border-slate-700/50 rounded-lg mb-2 p-2">
                    <div className="flex items-start justify-between gap-2 text-[10px]">
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-400 mb-0.5">****4506</p>
                        <p className="text-slate-200 line-clamp-2">Gasless Wire 1kg 0.8MM @1.0mm FluxCored Gasless Mig Welding Wire</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-slate-400">USDT</p>
                        <p className="text-emerald-400 font-semibold">1023.8</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-900/40 border border-slate-700/50 rounded-lg mb-2 p-2">
                    <div className="flex items-start justify-between gap-2 text-[10px]">
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-400 mb-0.5">****5262</p>
                        <p className="text-slate-200 line-clamp-2">Micol Emilly Princess Dress Kids 100% Cotton Gauze Birthday Party Dress Baby Girls Colorful Rainbow Kids Dress Girls Gift 0-6 years Old</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-slate-400">USDT</p>
                        <p className="text-emerald-400 font-semibold">1913.4</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-900/40 border border-slate-700/50 rounded-lg mb-2 p-2">
                    <div className="flex items-start justify-between gap-2 text-[10px]">
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-400 mb-0.5">****7929</p>
                        <p className="text-slate-200 line-clamp-2">NEW OCC NEVOKS 0.8 / 1.0 / 0.6 - CATRIDGE 1PCS / 2PCS</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-slate-400">USDT</p>
                        <p className="text-emerald-400 font-semibold">1387.4</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-900/40 border border-slate-700/50 rounded-lg mb-2 p-2">
                    <div className="flex items-start justify-between gap-2 text-[10px]">
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-400 mb-0.5">****7545</p>
                        <p className="text-slate-200 line-clamp-2">Dugro soy 400G DUMEX(1-6 Years) - (0-12 Months)</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-slate-400">USDT</p>
                        <p className="text-emerald-400 font-semibold">1195.9</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-2">
        <div className="mb-2">
          <h2 className="text-xs font-semibold text-slate-100">Danh sách đơn gần đây</h2>
        </div>
        <div className="relative">
          <style>{`
            @keyframes scroll-orders {
              0% {
                transform: translateY(0);
              }
              100% {
                transform: translateY(-50%);
              }
            }
            .scroll-orders-container {
              animation: scroll-orders 60s linear infinite;
            }
            .scroll-orders-container:hover {
              animation-play-state: paused;
            }
          `}</style>
          <div className="overflow-hidden max-h-[220px]">
            <div className="scroll-orders-container">
              {/* Lặp 2 lần để tạo hiệu ứng vô tận */}
              {[...Array(2)].map((_, duplicateIndex) => (
                <div key={duplicateIndex}>
                  {orders.map((o, index) => {
                    return (
                      <div
                        key={`${o.id}-${duplicateIndex}-${index}`}
                        className="bg-slate-900/40 border border-slate-700/50 rounded-lg mb-2 p-2 cursor-pointer hover:bg-slate-800/70 transition"
                        onClick={() => {
                          // Tìm sản phẩm tương ứng nếu có
                          const product = products.find(p => p.name === o.name) || {
                            id: o.id,
                            name: o.name,
                            imageUrl: '',
                            price: o.amount,
                            description: ''
                          };
                          setSelectedOrder({
                            id: o.id,
                            date: new Date().toISOString().slice(0, 19).replace('T', ' '),
                            product,
                            total: o.amount,
                            discount: o.commission || 0
                          });
                        }}
                      >
                        <div className="flex items-start justify-between gap-2 text-[10px]">
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-400 mb-0.5">{o.id}</p>
                            <p className="text-slate-200 line-clamp-2">{o.name}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-slate-400">USDT</p>
                            <p className="text-emerald-400 font-semibold">{o.amount.toFixed(1)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {toast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <div
              className="mx-auto w-[86%] max-w-[340px] px-3 py-2 rounded-lg bg-blue-600/80 text-white shadow-md text-xs font-medium flex items-center gap-2 animate-toast-enter"
              role="status"
              aria-live="polite"
            >
              <svg className="w-4 h-4 opacity-90 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" /></svg>
              <span className="text-xs leading-snug break-words">{toast}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersScreen;
