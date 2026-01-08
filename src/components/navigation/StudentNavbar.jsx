import { useNavigate, useLocation } from "react-router-dom";
import {
  FiHome,
  FiShoppingBag,
  FiClock,
  FiCreditCard,
  FiUser,
} from "react-icons/fi";

export default function StudentNavbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const nav = [
    { label: "Home", path: "/", icon: FiHome },
    { label: "Order", path: "/order", icon: FiShoppingBag },
    { label: "History", path: "/history", icon: FiClock },
    { label: "Khata", path: "/khata", icon: FiCreditCard },
    { label: "Profile", path: "/profile", icon: FiUser },
  ];

  return (
    <header className="hidden md:block sticky top-0 z-40 bg-[#fffaf2] shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
      {/* Soft app-like navbar */}
      <div className="bg-[#fffaf2]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center text-black font-bold shadow-sm">
              AK
            </div>
            <div>
              <p className="text-lg font-semibold leading-none text-gray-900">
                Aadi’s Kitchen
              </p>
              <p className="text-xs text-gray-500">Gharguti Food</p>
            </div>
          </div>

          {/* Navigation pills */}
          <nav className="flex items-center gap-2 bg-white/70 backdrop-blur px-2 py-2 rounded-2xl shadow-sm">
            {nav.map((n) => {
              const active = pathname === n.path;
              const Icon = n.icon;

              return (
                <button
                  key={n.path}
                  onClick={() => navigate(n.path)}
                  className={`flex cursor-pointer items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-yellow-400 text-black shadow-sm"
                      : "text-gray-600 hover:bg-yellow-100"
                  }`}
                >
                  <Icon size={16} />
                  {n.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
