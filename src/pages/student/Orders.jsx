import { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { useAuthUser } from "../../hooks/useAuthUser";
import { getTodayKey } from "../../services/menuService";

export default function StudentOrders() {
  const { authUser } = useAuthUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser) return;

    const today = getTodayKey(); // ✅ FIX: define today

    const q = query(
      collection(db, "orders"),
      where("studentId", "==", authUser.uid),
      where("date", "==", today),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setOrders(list);
        setLoading(false);
      },
      (err) => {
        console.error("Orders listener failed:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [authUser]);

  if (loading) {
    return <p className="text-center mt-10">Loading your orders…</p>;
  }

  if (orders.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-10">
        You haven’t placed any order today
      </p>
    );
  }

  return (
    <div className="pb-24">
      <h2 className="text-xl font-semibold mb-4">My Orders</h2>

      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="bg-white p-4 rounded-xl border">
            <div className="flex justify-between items-center">
              <p className="font-medium">
                {o.mealType} • {o.items.quantity} × {o.items.item}
              </p>

              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  o.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {o.status}
              </span>
            </div>

            {o.items.extras &&
              Object.values(o.items.extras).some((q) => q > 0) && (
                <p className="text-sm text-gray-600 mt-1">
                  Extras:{" "}
                  {Object.entries(o.items.extras)
                    .filter(([, q]) => q > 0)
                    .map(([name, q]) => `${name} × ${q}`)
                    .join(", ")}
                </p>
              )}

            <p className="text-sm text-gray-500 mt-2">
              Unit Price: ₹{o.items.unitPrice}
            </p>

            <p className="font-semibold mt-1">
              Total: ₹{o.items.unitPrice * o.items.quantity}
            </p>

            {o.status === "PENDING" && (
              <p className="text-xs text-red-500 mt-2">
                ⚠ Once confirmed, order cannot be changed
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
