import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { ADMIN_UID } from "../constants/admin";

export const useAuthUser = () => {
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile = null;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setLoading(true);

      // 🔹 Not logged in
      if (!user) {
        if (unsubProfile) unsubProfile();
        setAuthUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      const userRef = doc(db, "users", user.uid);

      // 🔥 Real-time profile listener
      unsubProfile = onSnapshot(
        userRef,
        async (snap) => {
          // 🛠️ SELF-HEALING: recreate profile if deleted
          if (!snap.exists()) {
            console.warn("User profile missing. Recreating for UID:", user.uid);

            const role = user.uid === ADMIN_UID ? "admin" : "student";

            await setDoc(userRef, {
              uid: user.uid,
              phone: user.phoneNumber || "",
              role,
              name: "",
              isActive: true,
              createdAt: serverTimestamp(),
            });

            // ⛔ Do NOT set state yet
            // Wait for Firestore to emit next snapshot
            return;
          }

          // ✅ Normal case
          setAuthUser(user);
          setProfile(snap.data());
          setLoading(false);
        },
        (error) => {
          console.error("Profile snapshot error:", error);
          setAuthUser(null);
          setProfile(null);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const role = profile?.role ?? null;
  const isProfileComplete = !!profile?.name;

  return {
    authUser, // Firebase Auth user
    profile, // Firestore profile doc
    role, // "admin" | "student" | null
    loading,
    isAuthenticated: !!authUser,
    isProfileComplete,
  };
};
