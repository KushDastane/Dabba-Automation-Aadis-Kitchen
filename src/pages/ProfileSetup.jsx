import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuthUser } from "../hooks/useAuthUser";

export default function ProfileSetup() {
  const { authUser, profile, loading } = useAuthUser();
  const [name, setName] = useState(profile?.name || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (loading || !authUser) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await updateDoc(doc(db, "users", authUser.uid), {
        name: name.trim(),
      });
      // 🔥 onSnapshot will auto-redirect to dashboard
    } catch (err) {
      setError("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h2 className="text-xl font-semibold mb-4">Complete Your Profile</h2>

      {/* Phone (read-only) */}
      <div className="mb-3 text-sm text-gray-600">
        Phone: {profile?.phone || authUser.phoneNumber}
      </div>

      {/* Name */}
      <input
        className="border p-2 w-full mb-3"
        placeholder="Your full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 w-full"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Continue"}
      </button>

      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}
