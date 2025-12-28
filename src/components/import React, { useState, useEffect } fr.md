import React, { useState, useEffect } from "react";
import { Product, formatCurrency } from "../data";

interface Order {
  id: string;
  name: string;
  amount: number;
  status: string;
}

function loadUserOrders(): Order[] {
  // TODO: Replace with real data source
  return [];
}

const OrdersScreen: React.FC = () => {
  // Mock/placeholder variables
  const accountName = "demo";
  const orderQuotaUsed = 0;
  const orderQuotaMax = 10;
  const balance = 1000000;
  const pendingOrders = 0;
  const mainProduct: Product = { name: "Demo Product", imageUrl: "", price: 0, description: "" };
  const handleMockClick = () => {};
  const hasEnoughBalance = true;
  const shortage = 0;

  const [orders, setOrders] = useState<Order[]>(() => loadUserOrders());
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(loadUserOrders());
    }, 2000);
    return () => clearInterval(interval);
  }, [accountName]);

  const [toast, setToast] = useState<string | null>(null);
  const [newOrderNotification, setNewOrderNotification] = useState<{ orderId: string; discount: number } | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<{
    id: string;
    date: string;
    product: Product;
    total: number;
    discount: number;
  } | null>(null);
  const [waitingForOrder, setWaitingForOrder] = useState<boolean>(false);
  const [violationModal, setViolationModal] = useState<{ title: string; message: string } | null>(null);

  // Placeholder functions
  const startWaitingForOrder = () => {};
  const closeOrderModal = () => setSelectedOrder(null);
  const sendOrder = () => {};

  return (
    <div className="flex-1 overflow-y-auto pb-24 relative">
      {/* Order summary card */}
      <div className="px-4 pt-4">
        <div className="rounded-2xl bg-white text-center py-4 px-2 mb-4 shadow border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <>
              <div className="flex-1 text-xs text-slate-500">Pending</div>
              <div className="flex-1 text-xs text-slate-500">Order Quantity</div>
              <div className="flex-1 text-xs text-slate-500">Balance</div>
            </>
          </div>
          <div className="flex justify-between items-center mb-2">
            <>
              <div className="flex-1 text-lg font-bold text-slate-800">{pendingOrders}</div>
              <div className="flex-1 text-lg font-bold text-slate-800">{orderQuotaMax}</div>
              <div className="flex-1 text-lg font-bold text-slate-800">{formatCurrency(balance)}</div>
            </>
          </div>
          <button
            className="w-full mt-2 py-3 rounded-full bg-gray-400 text-white font-bold text-base tracking-wide shadow hover:bg-gray-500 transition"
            onClick={startWaitingForOrder}
            disabled={waitingForOrder}
          >
            {waitingForOrder ? '🔄 Waiting for Orders...' : 'Start Grabbing Orders'}
          </button>
        </div>
      </div>

      {/* Success notification overlay */}
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

      {/* Tab and main product section */}
      <div className="px-4 pt-4">
        <h1 className="text-sm font-semibold text-slate-50 mb-2 flex items-center gap-2">
          <span className="text-lg">🛒</span>
          Đặt hàng
        </h1>
        <div className="inline-flex rounded-full bg-slate-900/80 p-1 text-[11px] mb-3 border border-slate-700/70">
          {["Mới", "Đang xử lý", "Hoàn thành"].map((label, idx) => (
            <button key={label} onClick={() => handleMockClick()} className={`px-3 py-1 rounded-full ${idx === 0 ? "bg-white text-slate-900" : "text-slate-300"}`}>
              {label}
            </button>
          ))}
        </div>
        {mainProduct && (
          <button type="button" onClick={() => handleMockClick()} className="w-full rounded-2xl bg-slate-900/90 overflow-hidden shadow-xl border border-slate-800 mb-4 text-left">
            <div className="px-4 pt-4">
              <div className="rounded-2xl bg-white text-center py-4 px-2 mb-4 shadow border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <>
                    <div className="flex-1 text-xs text-slate-500">Pending</div>
                    <div className="flex-1 text-xs text-slate-500">Order Quantity</div>
                    <div className="flex-1 text-xs text-slate-500">Balance</div>
                  </>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <>
                    <div className="flex-1 text-lg font-bold text-slate-800">{pendingOrders}</div>
                    <div className="flex-1 text-lg font-bold text-slate-800">{orderQuotaMax}</div>
                    <div className="flex-1 text-lg font-bold text-slate-800">{formatCurrency(balance)}</div>
                  </>
                </div>
                <button
                  className="w-full mt-2 py-3 rounded-full bg-gray-400 text-white font-bold text-base tracking-wide shadow hover:bg-gray-500 transition"
                  onClick={startWaitingForOrder}
                  disabled={waitingForOrder}
                >
                  {waitingForOrder ? '🔄 Waiting for Orders...' : 'Start Grabbing Orders'}
                </button>
              </div>
            </div>
            <button className="text-slate-500 text-sm p-1" onClick={closeOrderModal}>✕</button>
          </button>
        )}
      </div>

      {/* Đơn hàng đang xử lý - auto scroll */}
      <section className="px-4 mb-4 overflow-hidden">
        <div className="mb-2">
          <h2 className="text-xs font-semibold text-slate-100">Đơn hàng đang xử lý</h2>
        </div>
        <div className="relative">
          <div className="overflow-hidden max-h-[200px]">
            <div>
              {[...Array(2)].map((_, duplicateIndex) => (
                <div key={duplicateIndex}>
                  {/* TODO: Replace with real order data */}
                  <div className="bg-slate-900/40 border border-slate-700/50 rounded-lg mb-2 p-2">
                    <div className="flex items-start justify-between gap-2 text-[10px]">
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-400 mb-0.5">****9472</p>
                        <p className="text-slate-200 line-clamp-2">Demo order</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-slate-400">USDT</p>
                        <p className="text-emerald-400 font-semibold">1000.0</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Danh sách đơn gần đây */}
      <section className="px-4 pb-2">
        <div className="mb-2">
          <h2 className="text-xs font-semibold text-slate-100">Danh sách đơn gần đây</h2>
        </div>
        <div className="relative">
          <div className="overflow-hidden max-h-[220px]">
            <div>
              {[...Array(2)].map((_, duplicateIndex) => (
                <div key={duplicateIndex}>
                  {orders.map((o, index) => (
                    <div
                      key={`${o.id}-${duplicateIndex}-${index}`}
                      className="bg-slate-900/40 border border-slate-700/50 rounded-lg mb-2 p-2"
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
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Toast notification */}
      {toast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <div
              className="mx-auto w-[86%] max-w-[340px] px-3 py-2 rounded-lg bg-blue-600/80 text-white shadow-md text-xs font-medium flex items-center gap-2 animate-toast-enter"
              role="status"
              aria-live="polite"
            >
              <svg className="w-4 h-4 opacity-90 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
              <span className="text-xs leading-snug break-words">{toast}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersScreen;