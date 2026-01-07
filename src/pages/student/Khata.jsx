import { useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader";
import LedgerEntryCard from "../../components/cards/LedgerEntryCard";
import { useAuthUser } from "../../hooks/useAuthUser";
import { getStudentBalance } from "../../services/balanceService";
import { getStudentLedger } from "../../services/ledgerService";
import { formatDate } from "../../utils/dateUtils";
import { useNavigate } from "react-router-dom";

export default function Khata() {
  const { authUser } = useAuthUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [ledger, setLedger] = useState([]);

  useEffect(() => {
    if (!authUser) return;

    const loadKhata = async () => {
      setLoading(true);
      try {
        const bal = await getStudentBalance(authUser.uid);
        setSummary(bal);

        const entries = await getStudentLedger(authUser.uid);
        setLedger(entries);
      } catch (err) {
        console.error("Failed to load khata", err);
      } finally {
        setLoading(false);
      }
    };

    loadKhata();
  }, [authUser]);

  if (loading) {
    return <p className="text-center mt-10">Loading khata...</p>;
  }

  return (
    <div className="pb-24">
      <PageHeader name="My Khata" />

      {/* Balance */}
      <div className="bg-black text-white rounded-xl p-4 mb-4">
        <p className="text-sm opacity-80">Current Balance</p>
        <h2 className="text-3xl font-semibold mt-1">
          ₹ {summary?.balance ?? 0}
        </h2>
        <p className="text-xs opacity-70 mt-1">
          Credit: ₹{summary?.credit ?? 0} • Debit: ₹{summary?.debit ?? 0}
        </p>
      </div>

      {/* Add money (UI only for now) */}
      <button
        onClick={() => navigate("/add-payment")}
        className="w-full bg-green-600 text-white py-3 rounded-xl mb-6"
      >
        Add Money
      </button>

      {/* Ledger */}
      <h3 className="text-sm text-gray-500 mb-2">Recent Transactions</h3>

      {ledger.length === 0 ? (
        <p className="text-center text-gray-500 mt-6">No transactions yet</p>
      ) : (
        <div className="space-y-3">
          {ledger.map((entry) => (
            <LedgerEntryCard
              key={entry.id}
              type={entry.type}
              amount={entry.amount}
              label={entry.source}
              date={formatDate(entry.createdAt)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
