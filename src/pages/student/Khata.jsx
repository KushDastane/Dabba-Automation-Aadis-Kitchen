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

export default function Khata() {
  const { authUser } = useAuthUser();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [payments, setPayments] = useState([]);

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

  const groupedPending = groupByDate(pendingPayments);
  const groupedRejected = groupByDate(rejectedPayments);
  const groupedLedger = groupByDate(ledger);

  const getLedgerLabel = (entry) =>
    entry.source === "PAYMENT" ? "BALANCE ADDED" : "ORDER";

  /* ---------------- UI ---------------- */

  return (
    <div className="pb-28  min-h-screen">
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
            onClick={() => navigate("/add-payment")}
            className="mt-5 w-full rounded-2xl bg-yellow-400 py-3 font-medium text-black hover:bg-yellow-500 transition"
          >
            Add Money
          </button>
        </div>

        {/* PENDING PAYMENTS */}
        {pendingPayments.length > 0 && (
          <div className="mb-10">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
              Payment Verification
            </h3>

            {["today", "yesterday", "older"].map(
              (key) =>
                groupedPending[key].length > 0 && (
                  <div key={key} className="mb-6">
                    <p className="mb-3 text-xs font-medium text-gray-400 capitalize">
                      {key}
                    </p>

                    <div className="space-y-3">
                      {groupedPending[key].map((p) => (
                        <div
                          key={p.id}
                          className="rounded-2xl bg-white/70 backdrop-blur-md p-4 ring-1 ring-yellow-200 shadow-sm"
                        >
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-gray-900">
                              Balance Addition — ₹{p.amount}
                            </p>

                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-gray-400">
                            {formatDate(p.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
            )}
          </div>
        )}

        {/* TRANSACTION HISTORY */}
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
          Transaction History
        </h3>

        {/* REJECTED PAYMENTS */}
        {["today", "yesterday", "older"].map(
          (key) =>
            groupedRejected[key].length > 0 && (
              <div key={key} className="mb-6">
                <p className="mb-3 text-xs font-medium text-gray-400 capitalize">
                  {key}
                </p>

                <div className="space-y-3">
                  {groupedRejected[key].map((p) => (
                    <div
                      key={p.id}
                      className="rounded-2xl bg-white/70 backdrop-blur-md p-4 ring-1 ring-red-200 shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-red-700">
                          Balance Addition — ₹{p.amount}
                        </p>

                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">
                          Rejected
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-gray-400">
                        {formatDate(p.createdAt)}
                      </p>

                      <p className="mt-2 text-xs text-red-600">
                        Contact admin if this seems incorrect
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )
        )}

        {/* LEDGER */}
        {["today", "yesterday", "older"].map(
          (key) =>
            groupedLedger[key].length > 0 && (
              <div key={key} className="mb-6">
                <p className="mb-3 text-xs font-medium text-gray-400 capitalize">
                  {key}
                </p>

                <div className="space-y-3">
                  {groupedLedger[key].map((entry) => (
                    <LedgerEntryCard
                      key={entry.id}
                      type={entry.type}
                      amount={entry.amount}
                      label={getLedgerLabel(entry)}
                      date={formatDate(entry.createdAt)}
                    />
                  ))}
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
}
