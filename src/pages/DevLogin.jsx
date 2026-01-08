import { useState } from "react";
import { auth } from "../firebase/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { FiPhone, FiLock } from "react-icons/fi";

export default function DevLogin() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ---------------- HELPERS ---------------- */

  const sanitizePhone = (value) => value.replace(/\s+/g, "");

  /* ---------------- SEND OTP ---------------- */

  const sendOtp = async () => {
    const formattedPhone = sanitizePhone(phone);

    if (!formattedPhone || !formattedPhone.startsWith("+")) {
      alert("Enter phone number with country code (e.g. +91XXXXXXXXXX)");
      return;
    }

    try {
      setLoading(true);

      // ✅ Invisible reCAPTCHA (NO UI)
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
          }
        );
      }

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        window.recaptchaVerifier
      );

      setConfirmation(confirmationResult);
    } catch (err) {
      console.error("OTP ERROR:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- VERIFY OTP ---------------- */

  const verifyOtp = async () => {
    if (!confirmation || !code) {
      alert("Enter OTP");
      return;
    }

    try {
      setLoading(true);
      await confirmation.confirm(code);
      // ✅ User is logged in
      // auth.currentUser is now available
    } catch (err) {
      alert("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-[#faf9f6] to-orange-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
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
            <h2 className="text-lg font-semibold tracking-wide">
              AADI’S KITCHEN
            </h2>
            <p className="text-xs opacity-90">Gharghuti Tiffin Service</p>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-1">
            {confirmation ? "Verify OTP" : "Welcome Back"}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {confirmation
              ? `OTP sent to ${sanitizePhone(phone)}`
              : "Login using your phone number"}
          </p>

          {/* PHONE INPUT */}
          {!confirmation && (
            <div className="mb-4">
              <label className="text-xs text-gray-600 mb-1 block">
                Phone Number
              </label>
              <div className="flex items-center bg-[#faf9f6] rounded-xl px-3 py-3 border border-gray-200 focus-within:border-yellow-400 transition">
                <FiPhone className="text-gray-400 mr-2" />
                <input
                  placeholder="+91XXXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-transparent outline-none w-full text-sm"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* OTP INPUT */}
          {confirmation && (
            <div className="mb-4">
              <label className="text-xs text-gray-600 mb-1 block">
                One Time Password
              </label>
              <div className="flex items-center bg-[#faf9f6] rounded-xl px-3 py-3 border border-gray-200 focus-within:border-yellow-400 transition">
                <FiLock className="text-gray-400 mr-2" />
                <input
                  placeholder="6-digit OTP"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  className="bg-transparent outline-none w-full text-sm tracking-widest"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={confirmation ? verifyOtp : sendOtp}
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-70 text-black font-semibold py-3 rounded-xl transition shadow-md"
          >
            {loading
              ? "Please wait..."
              : confirmation
              ? "Verify & Continue"
              : "Continue"}
          </button>

          <p className="text-[11px] text-center text-gray-400 mt-4">
            OTP verification keeps your account secure.
          </p>
        </div>

        {/* FOOTER */}
        <div className="text-center text-[11px] text-gray-400 py-3 border-t">
          © 2026 Aadi’s Kitchen
        </div>
      </div>

      {/* REQUIRED for Firebase (Invisible, no UI impact) */}
      <div id="recaptcha-container" />
    </div>
  );
}
