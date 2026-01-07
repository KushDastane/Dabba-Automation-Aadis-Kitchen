import PageHeader from "../../components/layout/PageHeader";

export default function AdminDashboard() {
  return (
    <div>
      <PageHeader name="Admin Dashboard" />

      <div className="grid grid-cols-1 gap-4 mt-4">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Pending Orders</p>
          <h2 className="text-2xl font-semibold mt-1">5</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Payments to Verify</p>
          <h2 className="text-2xl font-semibold mt-1">2</h2>
        </div>
      </div>
    </div>
  );
}
