import { useEffect, useRef, useState } from "react";
import { auth } from "../firebase/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { FiPhone } from "react-icons/fi";

export default function DevLogin() {
  const [phone, setPhone] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [loading, setLoading] = useState(false);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(0);

  const [message, setMessage] = useState("");
  const [shake, setShake] = useState(false);

  const otpRefs = useRef([]);

  const fullPhone = `+91${phone}`;
  const isOtpComplete = otp.every((d) => d !== "");

  /* ---------------- TIMER ---------------- */

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  /* ---------------- AUTOFOCUS OTP ---------------- */

  useEffect(() => {
    if (confirmation) {
      otpRefs.current[0]?.focus();
    }
  }, [confirmation]);

  /* ---------------- SEND OTP ---------------- */

  const sendOtp = async () => {
    if (phone.length !== 10) {
      setMessage("Enter a valid 10-digit mobile number");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          { size: "invisible" }
        );
      }

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        fullPhone,
        window.recaptchaVerifier
      );

      setConfirmation(confirmationResult);
      setOtp(["", "", "", "", "", ""]);
      setTimer(30);
    } catch {
      setMessage("OTP could not be sent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- VERIFY OTP ---------------- */

  const verifyOtp = async () => {
    if (!confirmation || !isOtpComplete) return;

    try {
      setLoading(true);
      setMessage("");
      await confirmation.confirm(otp.join(""));
      // ✅ success
    } catch {
      setShake(true);
      setMessage("Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
      setTimeout(() => setShake(false), 350);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- OTP INPUT HANDLERS ---------------- */

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const changeNumber = () => {
    setConfirmation(null);
    setOtp(["", "", "", "", "", ""]);
    setMessage("");
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-[#fffaf2] to-orange-100 px-4 overflow-hidden">
      {/* 🔆 BACKGROUND BLOBS */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-yellow-200/40 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl" />

      {/* CARD */}
      <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* HERO */}
        <div className="relative h-36">
          <img
            src="/login.png"
            alt="Aadi's Kitchen"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-4 left-4 text-white">
            <div className="flex gap-2 mb-1">
              <span className="text-[11px] bg-green-500 px-2 py-0.5 rounded-full">
                100% Veg
              </span>
              <span className="text-[11px] bg-yellow-400 text-black px-2 py-0.5 rounded-full">
                Homemade
              </span>
            </div>
            <h2 className="text-lg font-semibold">AADI’S KITCHEN</h2>
            <p className="text-xs opacity-90">Gharghuti Tiffin Service</p>
          </div>
        </div>

        <div className="p-6 relative overflow-hidden">
          {message && (
            <div className="mb-4 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg px-3 py-2">
              {message}
            </div>
          )}

          {/* PHONE STEP */}
          <div
            className={`transition-all duration-500 ${
              confirmation
                ? "-translate-x-full opacity-0 absolute inset-0 px-6"
                : "translate-x-0 opacity-100"
            }`}
          >
            <h3 className="text-xl font-semibold mb-1">Welcome Home</h3>
            <p className="text-sm text-gray-500 mb-6">
              Login using your phone number
            </p>

            <label className="text-xs text-gray-600 mb-1 block">
              Phone Number
            </label>

            <div className="flex items-center bg-[#faf9f6] rounded-xl px-3 py-3 border border-gray-200 focus-within:border-yellow-400 transition mb-6">
              <FiPhone className="text-gray-400 mr-2" />
              <span className="text-sm font-medium mr-2">+91</span>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="XXXXXXXXXX"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                className="bg-transparent outline-none w-full text-sm tracking-widest"
                disabled={loading}
              />
            </div>

            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full cursor-pointer bg-yellow-400 hover:bg-yellow-500 disabled:opacity-70 text-black font-semibold py-3 rounded-xl transition shadow-md"
            >
              {loading ? "Please wait..." : "Continue"}
            </button>
          </div>

          {/* OTP STEP */}
          <div
            className={`transition-all duration-500 ${
              confirmation
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0 absolute inset-0 px-6"
            }`}
          >
            <h3 className="text-xl font-semibold mb-1">Verify OTP</h3>
            <p className="text-sm text-gray-500 mb-6">
              OTP sent to +91 {phone}
            </p>

            <label className="text-xs text-gray-600 mb-2 block">
              One Time Password
            </label>

            <div className="mx-auto w-[280px]">
              <div
                className={`flex justify-between gap-1 mb-4 ${
                  shake ? "animate-shake" : ""
                }`}
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    className="w-11 h-12 text-center text-lg font-semibold rounded-xl border border-gray-300 bg-[#faf9f6] focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 outline-none transition"
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            <div className="text-xs text-gray-500 mb-4">
              {timer > 0 ? (
                <>
                  Resend OTP in <span className="font-medium">{timer}s</span>
                </>
              ) : (
                <button
                  onClick={sendOtp}
                  className="text-yellow-600 cursor-pointer font-medium hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              onClick={verifyOtp}
              disabled={loading || !isOtpComplete}
              className="w-full bg-yellow-400 cursor-pointer hover:bg-yellow-500 disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition shadow-md"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>

            <button
              onClick={changeNumber}
              className="mt-3 text-xs cursor-pointer text-gray-500 underline w-full"
            >
              Change phone number
            </button>
          </div>
        </div>

        <div className="text-center text-[11px] text-gray-400 py-3 px-3 border-t">
          <p className="text-[10px]">
            This site is protected by reCAPTCHA and Google policies apply.
          </p>
        </div>
      </div>

      <div id="recaptcha-container" />

      {/* SHAKE */}
      <style>{`
        .animate-shake {
          animation: shake 0.35s ease-in-out;
        }
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          75% { transform: translateX(-4px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
