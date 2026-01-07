import { FiArrowDownLeft, FiArrowUpRight } from "react-icons/fi";

export default function LedgerEntryCard({
  type, // "CREDIT" | "DEBIT"
  amount,
  label,
  date,
}) {
  const isCredit = type === "CREDIT";

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-xs text-gray-500">{date}</p>
      </div>

      <div
        className={`flex items-center gap-1 font-medium ${
          isCredit ? "text-green-600" : "text-red-600"
        }`}
      >
        {isCredit ? <FiArrowDownLeft /> : <FiArrowUpRight />}₹ {amount}
      </div>
    </div>
  );
}
