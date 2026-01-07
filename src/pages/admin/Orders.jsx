import { useEffect, useState } from "react";
import { listenToTodayOrders } from "../../services/adminOrderService";
import { getTodayKey } from "../../services/menuService";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = listenToTodayOrders(getTodayKey(), async (list) => {
      // Fetch student names
      const enriched = await Promise.all(
        list.map(async (order) => {
          try {
            const snap = await getDoc(doc(db, "users", order.studentId));
            return {
              ...order,
              studentName: snap.exists()
                ? snap.data().name || "Student"
                : "Student",
            };
          } catch {
            return { ...order, studentName: "Student" };
          }
        })
      );

      setOrders(enriched);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500 mt-10">Loading orders…</p>;
  }

  if (orders.length === 0) {
    return <p className="text-center text-gray-500 mt-10">No orders yet</p>;
  }

  return (
    <div className="pb-24">
      <h2 className="text-xl font-semibold mb-4">Orders</h2>

      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{o.studentName}</p>
                <p className="text-sm text-gray-500">
                  {o.mealType} • {o.items.quantity} × {o.items.item}
                </p>

                {o.items.extras && Object.keys(o.items.extras).length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Extras:{" "}
                    {Object.entries(o.items.extras)
                      .filter(([, q]) => q > 0)
                      .map(([name, q]) => `${name} × ${q}`)
                      .join(", ")}
                  </p>
                )}
              </div>

              <button className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm">
                Confirm
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
