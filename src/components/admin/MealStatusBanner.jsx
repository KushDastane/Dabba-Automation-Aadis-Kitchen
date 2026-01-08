import {
  FiCheckCircle,
  FiAlertTriangle,
  FiCoffee,
  FiSun,
  FiMoon,
} from "react-icons/fi";

export default function MealStatusBanner({ menuAvailable, stats, slot }) {
  const SlotIcon =
    slot === "lunch" ? FiSun : slot === "dinner" ? FiMoon : FiCoffee;

  const StatusIcon = menuAvailable ? FiCheckCircle : FiAlertTriangle;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-3xl px-6 py-6 shadow-xl
      ${
        menuAvailable
          ? "bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617]"
          : "bg-gradient-to-br from-[#3f1d1d] via-[#450a0a] to-[#020617]"
      }`}
    >
      {/* glow */}
      <div
        className={`absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-30
        ${menuAvailable ? "bg-emerald-400" : "bg-red-500 animate-pulse"}`}
      />

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center
            ${
              menuAvailable
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            <SlotIcon size={24} />
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400">
              Current Meal
            </p>
            <p className="text-xl font-semibold text-white capitalize">
              {slot ?? "Closed"}
            </p>

            {!menuAvailable && (
              <p className="text-xs text-red-300 mt-1">
                Upload menu to start accepting orders
              </p>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col md:items-end gap-2">
          <div className="flex items-center gap-2">
            <StatusIcon
              size={20}
              className={menuAvailable ? "text-emerald-400" : "text-red-400"}
            />
            <span
              className={`text-sm font-semibold
              ${menuAvailable ? "text-emerald-400" : "text-red-400"}`}
            >
              {menuAvailable ? "Menu Uploaded" : "Menu Missing"}
            </span>
          </div>

          {stats && (
            <p className="text-xs text-gray-400">
              {stats.totalOrders} orders · {stats.studentsToday} students
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
