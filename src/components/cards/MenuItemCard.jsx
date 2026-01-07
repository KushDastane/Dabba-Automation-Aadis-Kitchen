import { FiMinus, FiPlus } from "react-icons/fi";

export default function MenuItemCard({
  name,
  price,
  quantity,
  onIncrement,
  onDecrement,
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center">
      <div>
        <h3 className="font-medium">{name}</h3>
        <p className="text-sm text-gray-500">₹ {price}</p>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={onDecrement} className="p-1 rounded-full bg-gray-100">
          <FiMinus />
        </button>

        <span className="min-w-[20px] text-center">{quantity}</span>

        <button onClick={onIncrement} className="p-1 rounded-full bg-gray-100">
          <FiPlus />
        </button>
      </div>
    </div>
  );
}
