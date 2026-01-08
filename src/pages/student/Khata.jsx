import { useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader";
import LedgerEntryCard from "../../components/cards/LedgerEntryCard";
import { useAuthUser } from "../../hooks/useAuthUser";
import { getStudentBalance } from "../../services/balanceService";
import { getStudentLedger } from "../../services/ledgerService";
import { formatDate } from "../../utils/dateUtils";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { LiaRupeeSignSolid } from "react-icons/lia";

export default function Khata() {
  const { authUser } = useAuthUser();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState("all");

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    if (!authUser) return;

    let unsubPayments;

    const loadKhata = async () => {
      setLoading(true);
      try {
        setSummary(await getStudentBalance(authUser.uid));
        setLedger(await getStudentLedger(authUser.uid));

        const q = query(
          collection(db, "payments"),
          where("studentId", "==", authUser.uid),
          orderBy("createdAt", "desc")
        );

        unsubPayments = onSnapshot(q, (snap) => {
          const list = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
          setPayments(list);
        });
      } catch (err) {
        console.error("Failed to load khata", err);
      } finally {
        setLoading(false);
      }
    };

    loadKhata();

    return () => {
      if (unsubPayments) unsubPayments();
    };
  }, [authUser]);

  if (loading) {
    return <p className="text-center mt-10">Loading khata...</p>;
  }

  /* ---------------- DATE HELPERS ---------------- */

  const normalizeDate = (ts) => (ts?.toDate ? ts.toDate() : new Date(ts));

  const isToday = (ts) => {
    const d = normalizeDate(ts);
    return d.toDateString() === new Date().toDateString();
  };

  const isYesterday = (ts) => {
    const d = normalizeDate(ts);
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return d.toDateString() === y.toDateString();
  };

  const groupByDate = (items) => ({
    today: items.filter((i) => isToday(i.createdAt)),
    yesterday: items.filter((i) => isYesterday(i.createdAt)),
    older: items.filter(
      (i) => !isToday(i.createdAt) && !isYesterday(i.createdAt)
    ),
  });

  /* ---------------- DATA SPLIT ---------------- */

  const pendingPayments = payments.filter((p) => p.status === "PENDING");
  const rejectedPayments = payments.filter((p) => p.status === "REJECTED");

  const getLedgerLabel = (entry) =>
    entry.source === "PAYMENT" ? "BALANCE ADDED" : "ORDER";

  /* ---------------- COMBINE ALL ITEMS ---------------- */

  const allItems = [
    ...pendingPayments.map((p) => ({ ...p, itemType: "pending" })),
    ...rejectedPayments.map((p) => ({ ...p, itemType: "rejected" })),
    ...ledger.map((l) => ({ ...l, itemType: "verified" })),
  ];

  // Filter based on filter state
  const filteredItems =
    filter === "all"
      ? allItems
      : allItems.filter((item) => item.itemType === filter);

  // Group by date
  const groupedItems = groupByDate(filteredItems);

  // Sort within each group: rejected first, then pending, then verified, then by createdAt descending
  const typeOrder = { rejected: 0, pending: 1, verified: 2 };
  Object.keys(groupedItems).forEach((key) => {
    groupedItems[key].sort((a, b) => {
      if (typeOrder[a.itemType] !== typeOrder[b.itemType]) {
        return typeOrder[a.itemType] - typeOrder[b.itemType];
      }
      return normalizeDate(b.createdAt) - normalizeDate(a.createdAt);
    });
  });

  /* ---------------- UI ---------------- */

  return (
    <div className="pb-28 py-6 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <PageHeader name="My Khata" />

        {/* SUMMARY */}
        <div className="mb-8 rounded-3xl bg-white/70 backdrop-blur-md p-5 ring-1 ring-black/5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Current Balance
          </p>

          <h2 className="mt-1 text-3xl font-semibold text-gray-900">
            ₹ {summary?.balance ?? 0}
          </h2>

          <p className="mt-1 text-xs text-gray-400">
            Credit ₹{summary?.credit ?? 0} • Debit ₹{summary?.debit ?? 0}
          </p>
          <button
            type="button"
            onClick={() => navigate("/add-payment")}
            className="mt-5 cursor-pointer  w-full flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 py-3 font-semibold text-black hover:bg-yellow-500 transition focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
          >
            <LiaRupeeSignSolid className="text-lg" />
            <span>Add Money</span>
          </button>
        </div>

        {/* FILTERS */}
        <div className="mb-6 flex md:gap-3 gap-1">
          {[
            { key: "all", label: "All" },
            { key: "rejected", label: "Rejected" },
            { key: "pending", label: "Pending" },
            { key: "verified", label: "Verified" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 cursor-pointer md:px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === key
                  ? "bg-yellow-400 text-black"
                  : "bg-white/70 text-gray-700 ring-1 ring-black/5 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* TRANSACTION HISTORY */}
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
          Transaction History
        </h3>

        {["today", "yesterday", "older"].map(
          (key) =>
            groupedItems[key].length > 0 && (
              <div key={key} className="mb-6">
                <p className="mb-3 text-xs font-medium text-gray-400 capitalize">
                  {key}
                </p>

                <div className="space-y-3">
                  {groupedItems[key].map((item) => {
                    if (item.itemType === "verified") {
                      return (
                        <LedgerEntryCard
                          key={item.id}
                          type={item.type}
                          amount={item.amount}
                          label={getLedgerLabel(item)}
                          date={formatDate(item.createdAt)}
                        />
                      );
                    } else {
                      // Payment item (pending or rejected)
                      const isRejected = item.itemType === "rejected";
                      return (
                        <div
                          key={item.id}
                          className={`rounded-2xl bg-white/70 backdrop-blur-md p-4 ring-1 shadow-sm ${
                            isRejected ? "ring-red-200" : "ring-yellow-200"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <p
                              className={`font-medium ${
                                isRejected ? "text-red-700" : "text-gray-900"
                              }`}
                            >
                              Balance Addition — ₹{item.amount}
                            </p>

                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                isRejected
                                  ? "bg-red-100 text-red-600"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {isRejected ? "Rejected" : "Pending"}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-gray-400">
                            {formatDate(item.createdAt)}
                          </p>

                          {isRejected && (
                            <p className="mt-2 text-xs text-red-600">
                              Contact admin if this seems incorrect
                            </p>
                          )}
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
}
