export default function Orders() {
  const orders = [
    { id: 1, name: "Rahul", meal: "Lunch" },
    { id: 2, name: "Amit", meal: "Dinner" },
  ];

  return (
    <div className="pb-24">
      <h2 className="text-xl font-semibold mb-4">Orders</h2>

      <div className="space-y-3">
        {orders.map((o) => (
          <div
            key={o.id}
            className="bg-white p-4 rounded-xl shadow-sm flex justify-between"
          >
            <div>
              <p className="font-medium">{o.name}</p>
              <p className="text-sm text-gray-500">{o.meal}</p>
            </div>

            <button className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm">
              Confirm
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
