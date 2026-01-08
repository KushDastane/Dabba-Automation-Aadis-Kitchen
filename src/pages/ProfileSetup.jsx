import { useState } from "react";
import { motion } from "framer-motion";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuthUser } from "../hooks/useAuthUser";
import { FiUser, FiPhone, FiArrowRight } from "react-icons/fi";

export default function ProfileSetup() {
  const { authUser, profile, loading } = useAuthUser();
  const [name, setName] = useState(profile?.name || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (loading || !authUser) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Please enter your full name");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await updateDoc(doc(db, "users", authUser.uid), {
        name: name.trim(),
      });
      // redirect handled via snapshot
    } catch {
      setError("Could not save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-[#fffaf2] to-orange-100 px-4 overflow-hidden">
      {/* BACKGROUND BLOBS */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-yellow-200/40 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl" />

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden"
      >
        {/* HERO */}
        <div className="relative h-28">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500" />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-4 left-4 text-white">
            <h2 className="text-lg font-semibold flex items-center gap-1">
              Almost There
            </h2>
            <p className="text-xs opacity-90">
              Complete your profile to continue
            </p>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg px-3 py-2"
            >
              {error}
            </motion.div>
          )}

          {/* PHONE (READ ONLY) */}
          <label className="text-xs text-gray-600 mb-1 block">
            Registered Phone
          </label>
          <div className="flex items-center bg-[#faf9f6] rounded-xl px-3 py-3 border border-gray-200 mb-5">
            <FiPhone className="text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700 tracking-wide">
              {profile?.phone || authUser.phoneNumber}
            </span>
          </div>

          {/* NAME */}
          <label className="text-xs text-gray-600 mb-1 block">Full Name</label>
          <div className="flex items-center bg-[#faf9f6] rounded-xl px-3 py-3 border border-gray-200 focus-within:border-yellow-400 transition mb-6">
            <FiUser className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-transparent outline-none w-full text-sm"
              disabled={saving}
            />
          </div>

          {/* CTA */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ y: -1 }}
            onClick={handleSave}
            disabled={saving}
            className="w-full cursor-pointer flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-black font-semibold py-3 rounded-xl transition shadow-md"
          >
            <span>{saving ? "Saving..." : "Continue"}</span>
            {!saving && <FiArrowRight />}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
