import { useEffect, useState } from "react";
import { listenToTodayOrders } from "../../services/adminOrderService";
import { getTodayKey } from "../../services/menuService";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { confirmOrder } from "../../services/orderService";
import {
  FiCheck,
  FiSearch,
  FiClock,
  FiUser,
  FiChevronRight,
} from "react-icons/fi";

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

  if (loading) {
    return (
      <p className="text-center text-gray-500 mt-16">Loading today’s orders…</p>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf2] pb-24 px-4 md:px-6 lg:px-10">
      {/* HEADER */}
      <div className="pt-6 mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
          Today’s Orders
        </h1>
        <p className="text-sm text-gray-600">
          Review and confirm today’s meals
        </p>
      </div>

      {/* SEARCH */}
      <div className="relative mb-4">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="Search student"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white rounded-2xl pl-11 pr-4 py-3 shadow-sm outline-none border border-black/5"
        />
      </div>

      {/* FILTERS */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {["ALL", "PENDING", "CONFIRMED"].map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition
              ${
                statusFilter === f
                  ? "bg-yellow-400 text-black"
                  : "bg-white text-gray-600 border border-black/10"
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ORDERS LIST */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <p className="text-center text-gray-500 mt-12">
            No orders match your filters
          </p>
        ) : (
          filteredOrders.map((o) => {
            const isConfirmed = o.status === "CONFIRMED";

            return (
              <div
                key={o.id}
                className={`rounded-3xl bg-white p-5 shadow-sm border
                ${
                  isConfirmed
                    ? "border-black/5"
                    : "border-yellow-300 ring-1 ring-yellow-200"
                }`}
              >
                {/* TOP ROW */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center
                      ${
                        isConfirmed
                          ? "bg-gray-100 text-gray-600"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {isConfirmed ? <FiCheck /> : <FiClock />}
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900 leading-tight">
                        {o.studentName}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <FiUser size={12} /> {o.mealType}
                      </p>
                    </div>
                  </div>

                  {!isConfirmed && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  )}
                </div>

                {/* MEAL INFO */}
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-800">
                    {o.items.quantity} × {o.items.item}
                  </p>

                  {o.items.extras &&
                    Object.values(o.items.extras).some((q) => q > 0) && (
                      <p className="text-xs text-gray-500 mt-1">
                        Extras:{" "}
                        {Object.entries(o.items.extras)
                          .filter(([, q]) => q > 0)
                          .map(([name, q]) => `${name} × ${q}`)
                          .join(", ")}
                      </p>
                    )}
                </div>

                {/* ACTION */}
                {!isConfirmed ? (
                  <button
                    disabled={confirmingId === o.id}
                    onClick={async () => {
                      try {
                        setConfirmingId(o.id);
                        await confirmOrder(o.id);
                      } finally {
                        setConfirmingId(null);
                      }
                    }}
                    className="mt-5 w-full bg-yellow-400 hover:bg-yellow-500 text-black py-2.5 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                  >
                    Confirm Order
                    <FiChevronRight />
                  </button>
                ) : (
                  <div className="mt-5 text-xs text-green-700 font-medium flex items-center gap-1">
                    <FiCheck /> Order confirmed
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
