import { FiClock, FiCheckCircle } from "react-icons/fi";

export default function OrderStatusCard({ meal, status }) {
  const isConfirmed = status === "CONFIRMED";

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Today’s {meal} Order</p>
          <h3 className="text-lg font-medium mt-1 capitalize">{status}</h3>
        </div>

        <div
          className={`text-2xl ${
            isConfirmed ? "text-green-500" : "text-orange-500"
          }`}
        >
          {isConfirmed ? <FiCheckCircle /> : <FiClock />}
        </div>
      </div>
    </div>
  );
}
