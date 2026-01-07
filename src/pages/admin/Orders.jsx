import { useEffect, useState } from "react";
import { listenToTodayOrders } from "../../services/adminOrderService";
import { getTodayKey } from "../../services/menuService";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { confirmOrder } from "../../services/orderService";
import { FiCheck, FiSearch } from "react-icons/fi";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    const unsub = listenToTodayOrders(getTodayKey(), async (list) => {
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
    return (
      <p className="text-center text-gray-500 mt-10">Loading today’s orders…</p>
    );
  }

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      searchTerm === "" ||
      o.studentName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PENDING" && o.status !== "CONFIRMED") ||
      (statusFilter === "CONFIRMED" && o.status === "CONFIRMED");

    return matchesSearch && matchesStatus;
  });

  if (orders.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-10">No orders placed today</p>
    );
  }

  return (
    <div className="pb-24 bg-[#faf9f6] min-h-screen px-4">
      {/* HEADER */}
      <h1 className="text-2xl font-semibold mt-4">Orders</h1>
      <p className="text-sm text-gray-500 mb-5">
        Manage today’s meal orders efficiently
      </p>

      {/* SEARCH */}
      <div className="relative mb-6">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="Search student name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white rounded-xl pl-11 pr-4 py-3 shadow-sm outline-none"
        />
      </div>

      {/* FILTERS */}
      <div className="flex gap-3 mb-6">
        {["ALL", "PENDING", "CONFIRMED"].map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              statusFilter === f
                ? "bg-black text-white"
                : "bg-white text-gray-600 border"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ORDERS LIST */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">
            No orders match your filters
          </p>
        ) : (
          <>
            {filteredOrders.map((o) => (
              <div key={o.id} className="bg-white rounded-2xl p-4 shadow-sm">
                {/* TOP */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-base font-semibold">{o.studentName}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {o.mealType} · Qty {o.items.quantity}
                    </p>
                  </div>

                  {/* STATUS */}
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      o.status === "CONFIRMED"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {o.status === "CONFIRMED"
                      ? "Confirmed"
                      : "Approval Pending"}
                  </span>
                </div>

                {/* DETAILS */}
                <div className="mt-3 text-sm text-gray-700">{o.items.item}</div>

                {o.items.extras &&
                  Object.values(o.items.extras).some((q) => q > 0) && (
                    <p className="text-xs text-gray-400 mt-1">
                      Extras:{" "}
                      {Object.entries(o.items.extras)
                        .filter(([, q]) => q > 0)
                        .map(([name, q]) => `${name} × ${q}`)
                        .join(", ")}
                    </p>
                  )}

                {/* ACTION */}
                {o.status !== "CONFIRMED" ? (
                  <button
                    disabled={confirmingId === o.id}
                    onClick={async () => {
                      try {
                        setConfirmingId(o.id);
                        await confirmOrder(o.id);
                      } catch {
                        alert("Failed to confirm order");
                      } finally {
                        setConfirmingId(null);
                      }
                    }}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black py-2.5 rounded-xl font-medium transition"
                  >
                    <FiCheck />
                    Confirm Order
                  </button>
                ) : (
                  <p className="mt-4 text-xs text-green-600 font-medium flex items-center gap-1">
                    <FiCheck /> Order confirmed
                  </p>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
