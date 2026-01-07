import { useLocation, useNavigate } from "react-router-dom";
import { FiHome, FiShoppingBag, FiCreditCard, FiUser } from "react-icons/fi";

export default function StudentBottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
      <div className="max-w-md mx-auto flex justify-between px-6 py-2 lg:max-w-3xl">
        <NavItem
          icon={<FiHome size={22} />}
          label="Home"
          active={pathname === "/"}
          onClick={() => navigate("/")}
        />
        <NavItem
          icon={<FiShoppingBag size={22} />}
          label="Order"
          active={pathname === "/order"}
          onClick={() => navigate("/order")}
        />
        <NavItem
          icon={<FiCreditCard size={22} />}
          label="Khata"
          active={pathname === "/khata"}
          onClick={() => navigate("/khata")}
        />
        <NavItem
          icon={<FiUser size={22} />}
          label="Profile"
          active={pathname === "/profile"}
          onClick={() => navigate("/profile")}
        />
      </div>
    </nav>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center text-xs ${
        active ? "text-black" : "text-gray-500"
      }`}
    >
      {icon}
      <span className="mt-1">{label}</span>
    </button>
  );
}
