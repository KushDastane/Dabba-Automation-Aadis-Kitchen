import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

export const useAuthUser = () => {
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setLoading(true);

      if (!user) {
        setAuthUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        console.error("User document missing for UID:", user.uid);
        setAuthUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setAuthUser(user);
      setProfile(snap.data());
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return {
    authUser,
    profile,
    role: loading ? null : profile.role, // 🔴 CRITICAL CHANGE
    loading,
  };
};
