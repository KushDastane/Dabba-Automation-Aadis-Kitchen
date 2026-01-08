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
import { FaExclamationTriangle } from "react-icons/fa";

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
    (o) =>
      sameMonth(o.createdAt) &&
      (o.status === "CONFIRMED" || o.status === "DELIVERED")
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
    <div className="pb-28  min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        {/* HEADER */}
        <div className="pt-4 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            My Thali History
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Your daily meals & monthly spending at a glance
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-4 mb-7">
          <div className="rounded-3xl bg-white/70 backdrop-blur-md p-4 ring-1 ring-black/5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Monthly Spend
            </p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              ₹{totalExpense}
            </p>
          </div>

          <div className="rounded-3xl bg-yellow-50 p-4 ring-1 ring-yellow-200 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-yellow-800">
              Tiffins This Month
            </p>
            <p className="mt-1 text-2xl font-semibold text-yellow-900">
              {totalTiffins}
            </p>
          </div>
        </div>

        {/* FILTER */}
        <div className="flex gap-2 mb-8">
          {[
            { key: "ALL", label: "All Orders" },
            { key: "THIS_MONTH", label: "This Month" },
          ].map((f) => {
            const active = monthFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setMonthFilter(f.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition
                ${
                  active
                    ? "bg-yellow-100 text-yellow-900 ring-2 ring-yellow-300"
                    : "bg-white/70 text-gray-700 ring-1 ring-black/5 hover:bg-gray-50"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* ORDER SECTIONS */}
        {["today", "yesterday", "older"].map(
          (key) =>
            groupedOrders[key].length > 0 && (
              <div key={key} className="mb-10">
                {/* SECTION HEADING — LEFT ALIGNED */}
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
                  {key}
                </h4>

                <div className="space-y-4">
                  {groupedOrders[key].map((o) => {
                    const { day, month } = formatDayPill(o.createdAt);
                    const price = Number(o.items?.unitPrice || 0);
                    const qty = Number(o.items?.quantity || 0);

                    return (
                      <div
                        key={o.id}
                        className="rounded-3xl bg-white/70 backdrop-blur-md p-4 ring-1 ring-black/5 shadow-sm flex gap-4"
                      >
                        {/* DATE */}
                        <div className="w-14 shrink-0 rounded-2xl bg-gray-50 py-2 text-center ring-1 ring-black/5">
                          <p className="text-[10px] tracking-wide text-gray-500">
                            {month}
                          </p>
                          <p className="text-xl font-semibold text-gray-900">
                            {day}
                          </p>
                        </div>

                        {/* CONTENT */}
                        <div className="flex-1">
                          <div className="flex justify-between gap-4">
                            <div>
                              <p className="text-xs text-gray-400">
                                {o.mealType}
                              </p>
                              <p className="font-medium text-gray-900">
                                {o.items?.item}
                              </p>
                              <p className="text-sm text-gray-500">
                                {qty} × ₹{price}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-lg font-semibold text-gray-900">
                                ₹{price * qty}
                              </p>
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
                            <p className="mt-2 text-xs text-red-500">
                              Order cannot be changed after confirmation
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
    </div>
  );
}
