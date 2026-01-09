export default function AdminStatCard({ label, value, highlight }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl p-5 transition-all duration-300
        ${
          highlight
            ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-black shadow-lg hover:bg-yellow-300"
            : "bg-white text-gray-900 ring-1 ring-black/5 hover:bg-yellow-50 hover:shadow-md"
        }`}
    >
      {/* GLOW LAYER (BEHIND) */}
      {highlight && (
        <div className="absolute inset-0 z-0 bg-yellow-300/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}

      {/* CONTENT */}
      <div className="relative z-10">
        <p
          className={`text-sm font-medium ${
            highlight ? "opacity-90" : "text-gray-500"
          }`}
        >
          {label}
        </p>

        <h2
          className={`mt-2 text-3xl font-bold tracking-tight ${
            highlight ? "text-black" : "text-gray-900"
          }`}
        >
          {value}
        </h2>
      </div>
    </div>
  );
}
