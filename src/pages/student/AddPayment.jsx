import { useState } from "react";
import PageHeader from "../../components/layout/PageHeader";
import { useAuthUser } from "../../hooks/useAuthUser";
import { submitPayment } from "../../services/paymentService";
import { FiUpload } from "react-icons/fi";

const UPI_ID = "aadis@oksbi";
const PAYEE_NAME = "Aadis Kitchen";

export default function AddPayment() {
  const { authUser } = useAuthUser();

  const [amount, setAmount] = useState("");
  const [slipFile, setSlipFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ---------------- CLOUDINARY UPLOAD ---------------- */

  const uploadSlipToCloudinary = async () => {
    if (!slipFile) return null;

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
    return data.secure_url;
  };

  /* ---------------- UPI ---------------- */

  const getUpiLink = () =>
    `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(
      PAYEE_NAME
    )}&am=${amount}&cu=INR`;

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Enter valid amount");
      return;
    }

    if (!slipFile) {
      alert("Please upload payment screenshot");
      return;
    }

    try {
      setLoading(true);

      const slipUrl = await uploadSlipToCloudinary();

      await submitPayment({
        studentId: authUser.uid,
        amount: Number(amount),
        slipUrl,
      });

      alert("Payment submitted for verification");

      setAmount("");
      setSlipFile(null);
      setPreview(null);
    } catch (err) {
      console.error(err);
      alert("Failed to submit payment");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="pb-24 bg-[#faf9f6] min-h-screen">
      <PageHeader name="Khata Payment" />

      {/* 💻 TABLET + DESKTOP → QR AT TOP */}
      <div className="hidden md:block bg-white rounded-xl p-4 mb-4 shadow-sm text-center">
        <p className="text-sm text-gray-600 mb-2">Pay using UPI</p>

        <img
          src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=aadis@oksbi"
          alt="UPI QR"
          className="mx-auto mb-2"
        />

        <p className="text-xs text-gray-500">
          UPI ID: <span className="font-medium">{UPI_ID}</span>
        </p>
      </div>

      {/* 2️⃣ CONFIRM AMOUNT */}
      <div className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        <p className="text-sm text-gray-500 mb-1">Confirm Amount Paid (₹)</p>
        <input
          type="number"
          min="1"
          step="1"
          value={amount}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "" || Number(val) > 0) {
              setAmount(val);
            }
          }}
          className="w-full text-xl font-semibold border-b outline-none py-2"
          placeholder="Enter amount"
        />
      </div>

      {/* 📱 MOBILE → UPI BUTTON BELOW AMOUNT */}
      <div className="md:hidden mb-4">
        <a
          href={getUpiLink()}
          className={`block py-3 rounded-xl font-medium text-center ${
            amount
              ? "bg-purple-600 text-white"
              : "bg-gray-300 text-gray-600 pointer-events-none"
          }`}
        >
          Pay via GPay / PhonePe
        </a>

        {!amount && (
          <p className="text-xs text-gray-400 text-center mt-2">
            Enter amount to enable payment
          </p>
        )}
      </div>

      {/* 3️⃣ UPLOAD SLIP */}
      <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <p className="text-sm text-gray-600 mb-2">Upload Payment Screenshot</p>

        <label className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer text-gray-500">
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
            className="mt-3 rounded-lg max-h-60 mx-auto border"
          />
        )}
      </div>

      {/* STATUS */}
      <div className="bg-yellow-50 text-yellow-800 text-sm p-3 rounded-lg mb-4">
        Status: Pending Verification
      </div>

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`w-full py-3 rounded-xl font-medium ${
          loading ? "bg-gray-400 text-white" : "bg-yellow-400 text-black"
        }`}
      >
        {loading ? "Submitting..." : "Submit Payment Details →"}
      </button>

      <p className="text-xs text-gray-400 text-center mt-3">
        Payments are manually verified within 24 hours
      </p>
    </div>
  );
}
