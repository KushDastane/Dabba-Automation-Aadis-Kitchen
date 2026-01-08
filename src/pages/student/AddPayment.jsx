import { useState } from "react";
import { FiArrowLeft, FiUpload, FiCreditCard } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import { useAuthUser } from "../../hooks/useAuthUser";
import { submitPayment } from "../../services/paymentService";

const UPI_ID = "aadis@oksbi";
const PAYEE_NAME = "Aadis Kitchen";

export default function AddPayment() {
  const { authUser } = useAuthUser();
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [slipFile, setSlipFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const isAmountValid = Number(amount) > 0;
  const isFormValid = isAmountValid && slipFile && !loading;

  const getUpiLink = () =>
    `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(
      PAYEE_NAME
    )}&am=${amount}&cu=INR`;

  const handleSubmit = async () => {
    if (!isFormValid) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", slipFile);
      formData.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      );

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        { method: "POST", body: formData }
      );

      const data = await res.json();

      await submitPayment({
        studentId: authUser.uid,
        amount: Number(amount),
        slipUrl: data.secure_url,
      });

      navigate("/khata");
    } catch (err) {
      console.error(err);
      alert("Failed to submit payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" min-h-screen ">
      {/* HEADER */}
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <button
          onClick={() => navigate("/khata")}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2"
        >
          <FiArrowLeft />
          Back to Khata
        </button>

        <h1 className="text-2xl font-semibold text-gray-900">
          Add Money to Khata
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Pay via UPI and upload receipt for verification
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-8 space-y-6">
        {/* QR CARD (DESKTOP) */}
        <div className="hidden md:block rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-3">
            <FiCreditCard />
            Pay using UPI
          </div>

          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=${UPI_ID}`}
            alt="UPI QR"
            className="mx-auto"
          />

          <p className="text-xs text-gray-500 mt-3">
            UPI ID: <span className="font-medium">{UPI_ID}</span>
          </p>
        </div>

        {/* AMOUNT */}
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Amount Paid
          </label>

          <div className="flex items-center gap-2 border-b border-gray-200 focus-within:border-yellow-400">
            <span className="text-2xl font-semibold text-gray-400">₹</span>

            <input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full py-2 text-2xl font-semibold text-gray-900 outline-none bg-transparent"
            />
          </div>
        </div>

        {/* MOBILE UPI */}
        <a
          href={isAmountValid ? getUpiLink() : undefined}
          className={`block text-center py-3 rounded-2xl font-medium transition
            ${
              isAmountValid
                ? "bg-yellow-400 text-black hover:bg-yellow-500"
                : "bg-gray-200 text-gray-500 pointer-events-none"
            }`}
        >
          Pay via UPI App
        </a>

        {!amount && (
          <p className="text-xs text-gray-400 text-center">
            Enter amount to enable UPI payment
          </p>
        )}

        {/* UPLOAD */}
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-gray-600 mb-3">
            Upload Payment Screenshot
          </p>

          <label className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer text-gray-500 hover:bg-gray-50">
            <FiUpload className="text-2xl mb-2" />
            <span className="text-sm">
              {preview ? "Change Screenshot" : "Tap to upload receipt"}
            </span>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                setSlipFile(file);
                setPreview(URL.createObjectURL(file));
              }}
            />
          </label>

          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-4 rounded-xl max-h-64 mx-auto border"
            />
          )}
        </div>
      </div>

      {/* SUBMIT */}
      <div className="max-w-3xl mx-auto px-4 py-7">
        <button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className={`w-full py-3.5 rounded-2xl font-semibold transition
            ${
              isFormValid
                ? "bg-yellow-400 text-black hover:bg-yellow-500"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          {loading ? "Submitting…" : "Submit Payment"}
        </button>
      </div>
    </div>
  );
}
