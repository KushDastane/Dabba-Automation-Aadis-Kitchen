import { FiPlusCircle } from "react-icons/fi";

export default function BalanceCard({ balance = 0 }) {
  return (
    <div className="bg-yellow-100 rounded-xl p-4 mb-4">
      <p className="text-sm text-yellow-800">Current Balance</p>

      <div className="flex justify-between items-center mt-2">
        <h2 className="text-2xl font-semibold text-yellow-900">₹ {balance}</h2>

        <button className="flex items-center gap-1 text-sm text-yellow-900 font-medium">
          <FiPlusCircle />
          Add Money
        </button>
      </div>
    </div>
  );
}
