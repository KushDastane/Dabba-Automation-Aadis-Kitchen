import { useEffect, useMemo, useState } from "react";
import { db } from "../../firebase/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { useAuthUser } from "../../hooks/useAuthUser";

/* ---------------- DATE HELPERS ---------------- */

const normalizeDate = (ts) => (ts?.toDate ? ts.toDate() : new Date(ts));

const isToday = (ts) =>
  normalizeDate(ts).toDateString() === new Date().toDateString();

const isYesterday = (ts) => {
  const d = normalizeDate(ts);
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return d.toDateString() === y.toDateString();
};

const sameMonth = (ts) => {
  const d = normalizeDate(ts);
  const now = new Date();
  return (
    d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  );
};

const groupByDate = (items) => ({
  today: items.filter((i) => isToday(i.createdAt)),
  yesterday: items.filter((i) => isYesterday(i.createdAt)),
  older: items.filter(
    (i) => !isToday(i.createdAt) && !isYesterday(i.createdAt)
  ),
});

const formatDayPill = (ts) => {
  const d = normalizeDate(ts);
  return {
    day: d.getDate(),
    month: d.toLocaleString("default", { month: "short" }).toUpperCase(),
  };
};

/* ---------------- STATUS STYLE ---------------- */

const statusStyle = (status) => {
  switch (status) {
    case "DELIVERED":
      return "text-green-600 bg-green-50";
    case "CONFIRMED":
      return "text-blue-600 bg-blue-50";
    case "COOKING":
      return "text-orange-600 bg-orange-50";
    case "CANCELLED":
      return "text-red-600 bg-red-50";
    default:
      return "text-gray-500 bg-gray-100";
  }
};

export default function StudentOrders() {
  const { authUser } = useAuthUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState("THIS_MONTH"); // ALL | THIS_MONTH

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    if (!authUser) return;

    const q = query(
      collection(db, "orders"),
      where("studentId", "==", authUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setOrders(list);
      setLoading(false);
    });

    return () => unsub();
  }, [authUser]);

  /* ---------------- FILTER ---------------- */

  const filteredOrders = useMemo(() => {
    if (monthFilter === "ALL") return orders;
    return orders.filter((o) => sameMonth(o.createdAt));
  }, [orders, monthFilter]);

  const groupedOrders = groupByDate(filteredOrders);

  /* ---------------- STATS (SAFE) ---------------- */

  const monthlyOrders = orders.filter(
    (o) => sameMonth(o.createdAt) && o.status !== "CANCELLED"
  );

  const totalExpense = monthlyOrders.reduce((sum, o) => {
    const price = Number(o.items?.unitPrice || 0);
    const qty = Number(o.items?.quantity || 0);
    return sum + price * qty;
  }, 0);

  const totalTiffins = monthlyOrders.reduce((sum, o) => {
    const qty = Number(o.items?.quantity || 0);
    return sum + qty;
  }, 0);

  if (loading) {
    return <p className="text-center mt-10">Loading your orders…</p>;
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="pb-24 bg-[#faf9f6] min-h-screen">
      {/* HEADER */}
      <h2 className="text-2xl font-semibold mb-1">My Thali History</h2>
      <p className="text-sm text-gray-500 mb-4">
        Track your daily tiffins and expenses
      </p>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total Expense (This Month)</p>
          <p className="text-xl font-semibold mt-1">₹{totalExpense}</p>
        </div>

        <div className="bg-[#f7fbe9] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-600">Tiffins This Month</p>
          <p className="text-xl font-semibold mt-1">{totalTiffins}</p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setMonthFilter("ALL")}
          className={`px-4 py-1.5 rounded-full text-sm ${
            monthFilter === "ALL"
              ? "bg-black text-white"
              : "bg-white text-gray-700 shadow-sm"
          }`}
        >
          All Orders
        </button>

        <button
          onClick={() => setMonthFilter("THIS_MONTH")}
          className={`px-4 py-1.5 rounded-full text-sm ${
            monthFilter === "THIS_MONTH"
              ? "bg-black text-white"
              : "bg-white text-gray-700 shadow-sm"
          }`}
        >
          This Month
        </button>
      </div>

      {/* ORDERS */}
      {["today", "yesterday", "older"].map(
        (key) =>
          groupedOrders[key].length > 0 && (
            <div key={key} className="mb-6">
              <p className="text-sm text-gray-500 mb-3 capitalize">{key}</p>

              <div className="space-y-3">
                {groupedOrders[key].map((o) => {
                  const { day, month } = formatDayPill(o.createdAt);
                  const price = Number(o.items?.unitPrice || 0);
                  const qty = Number(o.items?.quantity || 0);

                  return (
                    <div
                      key={o.id}
                      className="bg-white rounded-2xl p-4 shadow-sm flex gap-4"
                    >
                      {/* DATE */}
                      <div className="w-12 text-center rounded-xl bg-gray-50 py-2">
                        <p className="text-xs text-gray-500">{month}</p>
                        <p className="text-lg font-semibold">{day}</p>
                      </div>

                      {/* CONTENT */}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <p className="text-xs text-gray-400">
                              {o.mealType}
                            </p>
                            <p className="font-medium">{o.items?.item}</p>
                            <p className="text-sm text-gray-500">
                              {qty} × ₹{price}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold">₹{price * qty}</p>
                            <span
                              className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${statusStyle(
                                o.status
                              )}`}
                            >
                              {o.status}
                            </span>
                          </div>
                        </div>

                        {o.status === "PENDING" && (
                          <p className="text-xs text-red-500 mt-2">
                            ⚠ Once confirmed, order cannot be changed
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
      )}
    </div>
  );
}
