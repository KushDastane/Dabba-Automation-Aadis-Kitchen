export default function BalanceCard({ summary }) {
  if (!summary) return null;

  const { credit = 0, debit = 0, balance = 0 } = summary;

  return (
    <div className="bg-yellow-100 rounded-xl p-4">
      <p className="text-sm text-gray-600 mb-1">Current Balance</p>

      <h2 className="text-2xl font-bold">₹ {balance}</h2>

      <div className="flex justify-between text-xs text-gray-600 mt-2">
        <span>Credit: ₹{credit}</span>
        <span>Debit: ₹{debit}</span>
      </div>
    </div>
  );
}
