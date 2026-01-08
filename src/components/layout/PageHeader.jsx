import { FiSun } from "react-icons/fi";

export default function PageHeader({ name }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 text-gray-600 text-sm"></div>
      <h1 className="text-2xl font-semibold mt-1">{name || "Student"}</h1>
    </div>
  );
}
