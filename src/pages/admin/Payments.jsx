export default function Payments() {
  const payments = [
    { id: 1, name: "Rahul", amount: 500 },
    { id: 2, name: "Amit", amount: 300 },
  ];

  return (
    <div className="pb-24">
      <h2 className="text-xl font-semibold mb-4">Payments</h2>

      <div className="space-y-3">
        {payments.map((p) => (
          <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex justify-between mb-2">
              <p className="font-medium">{p.name}</p>
              <p className="font-medium">₹ {p.amount}</p>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-green-600 text-white py-1 rounded-lg">
                Accept
              </button>
              <button className="flex-1 bg-red-100 text-red-600 py-1 rounded-lg">
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
