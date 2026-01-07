export default function AdminStatCard({ label, value, highlight }) {
  return (
    <div
      className={`rounded-xl p-4 border ${
        highlight ? "bg-black text-white" : "bg-white"
      }`}
    >
      <p className="text-sm opacity-70">{label}</p>
      <h2 className="text-2xl font-semibold mt-1">{value}</h2>
    </div>
  );
}
