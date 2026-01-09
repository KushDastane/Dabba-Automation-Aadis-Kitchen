export default function CookingSummary({ summary }) {
  if (!summary) return null;

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">
        Cooking Summary (Confirmed Orders)
      </h3>

      {/* MAIN COUNTS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard label="Half Dabba" value={summary.halfDabba} />
        <SummaryCard label="Full Dabba" value={summary.fullDabba} />
        <SummaryCard label="Total Rotis" value={summary.roti} />
        <SummaryCard label="Sabzi" value={summary.sabzi} />
        <SummaryCard label="Dal" value={summary.dal} />
        <SummaryCard label="Rice" value={summary.rice} />
        <SummaryCard label="Extra Rotis" value={summary.extraRoti} />
      </div>

      {/* OTHER ITEMS */}
      {Object.keys(summary.otherItems).length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Other Items</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(summary.otherItems).map(([name, qty]) => (
              <span
                key={name}
                className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-900 text-sm font-medium"
              >
                {name} × {qty}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-xl border bg-gray-50 px-4 py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}
