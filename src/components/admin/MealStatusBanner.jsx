import { getCurrentMealSlot } from "../../services/menuService";

export default function MealStatusBanner({ menuAvailable }) {
  const slot = getCurrentMealSlot();

  return (
    <div className="bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl p-4 mb-4">
      <p className="text-sm opacity-90">Current Meal</p>
      <h2 className="text-xl font-semibold capitalize mt-1">{slot}</h2>

      <p className="text-sm mt-2">
        Menu:{" "}
        <span className="font-medium">
          {menuAvailable ? "Uploaded" : "Not Uploaded"}
        </span>
      </p>
    </div>
  );
}
