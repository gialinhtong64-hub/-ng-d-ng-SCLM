import React, { useEffect, useState } from "react";
import { fetchPendingDeposits, approveDeposit, rejectDeposit, DepositRequestRow } from "../logic/depositRequests";

const BANKER_NAME = "banker"; // Có thể lấy từ localStorage nếu cần

const BankerDepositsScreen: React.FC = () => {
  const [pending, setPending] = useState<DepositRequestRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await fetchPendingDeposits();
    setPending(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // Realtime reload khi có insert/update
    // @ts-ignore
    const channel = window.supabase?.channel ? window.supabase.channel("deposit_requests_admin") : null;
    if (channel) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: "deposit_requests" },
        () => load()
      ).subscribe();
    }
    return () => {
      if (channel) channel.unsubscribe();
    };
  }, []);

  const handleApprove = async (id: number) => {
    await approveDeposit({ requestId: id, banker: BANKER_NAME });
    load();
  };
  const handleReject = async (id: number) => {
    const reason = prompt("Lý do từ chối?") || "";
    await rejectDeposit({ requestId: id, banker: BANKER_NAME, reason });
    load();
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Yêu cầu nạp tiền chờ duyệt</h1>
      {loading && <div>Đang tải...</div>}
      <div className="space-y-4">
        {pending.length === 0 && <div className="text-slate-500">Không có yêu cầu nào</div>}
        {pending.map((r) => (
          <div key={r.id} className="bg-white rounded-xl p-4 shadow flex justify-between items-center">
            <div>
              <div className="font-semibold">User: {r.account_name} (ID: {r.user_id})</div>
              <div>Số tiền: <span className="font-bold text-emerald-600">${r.amount}</span></div>
              <div className="text-xs text-slate-500">Tạo lúc: {new Date(r.created_at).toLocaleString()}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleApprove(r.id)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl">Duyệt</button>
              <button onClick={() => handleReject(r.id)} className="px-4 py-2 bg-red-600 text-white rounded-xl">Từ chối</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BankerDepositsScreen;
