import React from "react";
import { TabKey } from "../types";

interface BottomNavProps {
  active: TabKey;
  onChange: (t: TabKey) => void;
  onCSKH?: () => void;
  onProfile?: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ active, onChange, onCSKH, onProfile }) => {
  // Thứ tự: Trang chủ, CSKH, Đơn hàng (giữa), Ví, Tài khoản
  const items: { key: string; label: string; icon: string }[] = [
    { key: "home", label: "Trang chủ", icon: "/nav-home.png" },
    { key: "cskh", label: "CSKH", icon: "/nav-cskh.png" },
    { key: "orders", label: "Đơn hàng", icon: "/nav-orders.png" },
    { key: "wallet", label: "Ví", icon: "/nav-wallet.png" },
    { key: "profile", label: "Tài khoản", icon: "/nav-profile.png" },
  ];

  return (
    <nav className="absolute bottom-0 left-0 w-full h-24 flex items-center justify-center rounded-b-2xl z-40 shadow-xl overflow-visible">
      {/* Nền mờ bo tròn cho nav */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-3 w-[92%] h-16 bg-white/10 backdrop-blur-md rounded-full z-10 shadow-lg"></div>
  {/* Không còn logo phủ lên nav-bar */}
      <div className="w-full flex items-center justify-between px-4 py-2 gap-2 relative z-20">
        <div className="flex items-center justify-center gap-2 w-full">
          {items.map((item, idx) => {
            const isActive = item.key === active;
            const isCenter = item.key === "orders";
            const handleClick = () => {
              if (item.key === "cskh" && onCSKH) return onCSKH();
              if (item.key === "profile" && onProfile) return onProfile();
              if (item.key !== "cskh" && item.key !== "profile") return onChange(item.key as TabKey);
            };
            return (
              <button
                key={item.key}
                onClick={handleClick}
                className={`flex flex-col items-center justify-center gap-1 text-[11px] ${isCenter ? "w-16 h-16" : "w-12 h-12"} bg-transparent shadow-none border-none`}
                style={{ background: 'none', boxShadow: 'none', border: 'none' }}
              >
                <img
                  src={item.icon}
                  alt={item.label}
                  className={`${isCenter ? "h-10 w-10" : "h-7 w-7"} mb-1 object-contain`}
                  draggable={false}
                />
                <span className={isActive ? "text-emerald-300 font-semibold" : "text-slate-400"}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
