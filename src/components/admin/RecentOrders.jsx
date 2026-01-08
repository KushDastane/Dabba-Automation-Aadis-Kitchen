import { useEffect, useState } from "react";
import { FiCheck, FiClock } from "react-icons/fi";
import { listenToTodayOrders } from "../../services/adminOrderService";
import { getTodayKey } from "../../services/menuService";

export default function RecentOrdersPreview({ onConfirm }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const unsub = listenToTodayOrders(getTodayKey(), (list) => {
      setOrders(list.slice(0, 5));
    });
    return () => unsub();
  }, []);

  if (orders.length === 0) {
    return (
      <div className="mt-10 text-center text-sm text-gray-500">
        No orders placed yet today
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => {
        const isConfirmed = o.status === "CONFIRMED";

        return (
          <div
            key={o.id}
            className="flex items-center justify-between rounded-2xl bg-[#fffaf2] px-5 py-4 shadow-sm"
          >
            {/* LEFT */}
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-gray-900">
                {o.items.quantity} × {o.items.item}
              </p>
              <p className="text-xs text-gray-500 capitalize">{o.mealType}</p>
            </div>

            {/* RIGHT */}
            {isConfirmed ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <FiCheck size={14} />
                Confirmed
              </span>
            ) : (
              <button
                onClick={() => onConfirm(o.id)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black text-sm font-semibold transition"
              >
                <FiClock size={14} />
                Confirm
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
