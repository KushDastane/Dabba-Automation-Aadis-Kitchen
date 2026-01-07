import { useNavigate } from "react-router-dom";

export default function AdminQuickActions() {
  const nav = useNavigate();

  return (
    <div className="grid grid-cols-3 gap-3 mt-6">
      <button
        onClick={() => nav("/orders")}
        className="bg-black text-white py-3 rounded-xl"
      >
        Orders
      </button>
      <button
        onClick={() => nav("/menu")}
        className="bg-black text-white py-3 rounded-xl"
      >
        Menu
      </button>
      <button
        onClick={() => nav("/payments")}
        className="bg-black text-white py-3 rounded-xl"
      >
        Payments
      </button>
    </div>
  );
}
