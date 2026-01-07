import { useEffect, useState } from "react";
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
    return <p className="text-center text-gray-500 mt-6">No orders yet</p>;
  }

  return (
    <div className="mt-6">
      <h3 className="text-sm text-gray-500 mb-2">Recent Orders</h3>

      <div className="space-y-3">
        {orders.map((o) => (
          <div
            key={o.id}
            className="bg-white p-3 rounded-xl border flex justify-between items-center"
          >
            <div>
              <p className="font-medium text-sm">
                {o.items.quantity} × {o.items.item}
              </p>
              <p className="text-xs text-gray-500">{o.mealType}</p>
            </div>

            <button
              onClick={() => onConfirm(o.id)}
              className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
            >
              Confirm
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
