import { useState } from "react";
import PageHeader from "../../components/layout/PageHeader";
import { useAuthUser } from "../../hooks/useAuthUser";
import { submitPayment } from "../../services/paymentService";

export default function AddPayment() {
  const { authUser } = useAuthUser();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Enter valid amount");
      return;
    }

    try {
      setLoading(true);
      await submitPayment({
        studentId: authUser.uid,
        amount: Number(amount),
        slipUrl: null, // future proof
      });
      alert("Payment submitted for review");
      setAmount("");
    } catch (err) {
      alert("Failed to submit payment");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24">
      <PageHeader name="Add Payment" />

      <div className="bg-white rounded-xl p-4">
        <label className="text-sm text-gray-600">Amount Paid</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border p-2 rounded-lg mt-1"
          placeholder="Enter amount"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-xl mt-4"
      >
        {loading ? "Submitting..." : "Submit Payment"}
      </button>
    </div>
  );
}
