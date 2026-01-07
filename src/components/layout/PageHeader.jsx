import { FiSun } from "react-icons/fi";

export default function PageHeader({ name }) {
  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 text-gray-600 text-sm">
        <FiSun />
        <span>{greeting}</span>
      </div>
      <h1 className="text-2xl font-semibold mt-1">{name || "Student"}</h1>
    </div>
  );
}
