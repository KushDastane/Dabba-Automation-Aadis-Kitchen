import { useLocation, useNavigate } from "react-router-dom";
import { FiHome, FiClipboard, FiCreditCard, FiBookOpen } from "react-icons/fi";

export default function AdminBottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
      <div className="max-w-md mx-auto flex justify-between px-6 py-2 lg:max-w-3xl">
        <NavItem
          icon={<FiHome />}
          label="Home"
          active={pathname === "/"}
          onClick={() => navigate("/")}
        />
        <NavItem
          icon={<FiClipboard />}
          label="Orders"
          active={pathname === "/orders"}
          onClick={() => navigate("/orders")}
        />
        <NavItem
          icon={<FiBookOpen />}
          label="Menu"
          active={pathname === "/menu"}
          onClick={() => navigate("/menu")}
        />
        <NavItem
          icon={<FiCreditCard />}
          label="Payments"
          active={pathname === "/payments"}
          onClick={() => navigate("/payments")}
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
